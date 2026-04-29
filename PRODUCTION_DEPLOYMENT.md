# 🚀 JobPortal Master Production Runbook

This is your step-by-step, highly actionable runbook. Follow these phases in exact order to deploy your infrastructure, launch your MERN application with zero downtime, and monitor its health.

---

## 🟢 PHASE 1: Pre-flight Checklist

Before you type a single command, ensure your GitHub repository has the required secrets.
Go to your repo **Settings > Secrets and variables > Actions** and add:

- [ ] `DOCKERHUB_USERNAME` (Your Docker Hub ID)
- [ ] `DOCKERHUB_TOKEN` (Your Docker Hub Access Token)
- [ ] `SONAR_TOKEN` (Your SonarCloud/SonarQube Token)
- [ ] `SONAR_HOST_URL` (URL to your Sonar server)

---

## 🏗️ PHASE 2: Infrastructure Provisioning (The Ops Stack)

In this phase, we use Helm to install your API Gateway, Kafka Message Broker, ArgoCD GitOps engine, and your entire Monitoring Stack (Prometheus/Grafana).

**1. Connect to your Kubernetes Cluster:**
```bash
aws eks update-kubeconfig --name jobportal-cluster --region us-east-1
```

**2. Download Helm Dependencies:**
```bash
cd helm/jobportal-ops
helm dependency update
```

**3. Install the Infrastructure:**
```bash
helm install ops-stack . --namespace monitoring --create-namespace
```
*(Wait 2-3 minutes for all pods to spin up. You now have NGINX Ingress, Kafka, Prometheus, Grafana, Blackbox Exporter, Node Exporter, ArgoCD, and Argo Rollouts running!)*

---

## 🚀 PHASE 3: The Application Deployment (GitOps)

You will never use `kubectl apply` for your app. We use ArgoCD to pull changes directly from GitHub.

**1. Trigger the Pipeline:**
* Commit your code and `git push origin main`.
* *Result:* GitHub Actions runs Trivy security scans, builds your Docker images, pushes them to Docker Hub, and automatically updates `k8s/frontend-rollout.yaml` and `k8s/backend-rollout.yaml` with the new image tags.

**2. Connect ArgoCD:**
* Get your NGINX API Gateway external IP:
  ```bash
  kubectl get svc -n monitoring ops-stack-ingress-nginx-controller
  ```
* Open your browser and go to: `http://argocd.jobportal.local` (ensure your DNS/hosts file points to the NGINX IP).
* In ArgoCD, click **+ New App**. 
* Point it to your GitHub Repository URL, set the path to `k8s/`, and click **Sync**.

---

## 🔵🟢 PHASE 4: Blue-Green Promotion

ArgoCD just deployed your app. When you push a *new* update tomorrow, here is how you safely switch traffic:

**1. Wait for the Green Deployment:**
* ArgoCD detects your new GitHub commit and spins up the **GREEN** (new) version of your API and Frontend next to the **BLUE** (live) version.
* Live users are still safely using the **BLUE** version.

**2. Test the Green Version:**
* Hit your private preview endpoints to verify the new features work without breaking production.

**3. Promote:**
* Open the Argo Rollouts Dashboard: `http://rollouts.jobportal.local`.
* Click **Promote**. 100% of user traffic instantly shifts to the **GREEN** version. The old **BLUE** version is safely deleted.

---

## 📊 PHASE 5: Monitoring & Observability

Now that your app is live, you must monitor its health using the tools we installed in Phase 2.

**1. View Grafana Dashboards:**
* Go to: `http://grafana.jobportal.local`.
* Login with username `admin` and password `admin`.
* **What to check:** Import standard Kubernetes and NGINX dashboards to monitor your HTTP error rates and traffic spikes.

**2. Check Hardware Health (Node Exporter):**
* In Grafana, search for Node Exporter dashboards. You can see exactly how much CPU and RAM your EKS worker nodes are consuming.

**3. Check Endpoint Uptime (Blackbox Exporter):**
* Blackbox is actively pinging your frontend and backend APIs every few seconds. If the backend throws a 500 Error, Blackbox catches it instantly.

**4. Check Alerts (Alertmanager):**
* If Blackbox detects downtime, or Node Exporter detects 99% RAM usage, Alertmanager will automatically fire an alert (which you can configure in `values.yaml` to send straight to your Slack channel).
