import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, BriefcaseBusiness, Target, Bookmark, TrendingUp, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import heroIllustration from '../assets/hero-illustration.png';

/* ── Feature bullets ── */
const FEATURES = [
  { icon: Target,     color: 'bg-indigo-100 text-indigo-600', title: 'Discover Opportunities', desc: 'Find internships and entry-level jobs from top companies.' },
  { icon: Bookmark,   color: 'bg-purple-100 text-purple-600', title: 'Save & Track',           desc: 'Save jobs and track your applications in one place.' },
  { icon: TrendingUp, color: 'bg-blue-100 text-blue-600',     title: 'Grow Your Career',       desc: 'Build skills, get noticed and advance your career.' },
];

/* ══════════════════════════════════════════════
   Legal Modal — reusable for ToS and Privacy
══════════════════════════════════════════════ */
const LegalModal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      {/* Scrollable content */}
      <div className="overflow-y-auto px-6 py-5 text-sm text-gray-700 leading-relaxed space-y-5 flex-1">
        {children}
      </div>
      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
        <button onClick={onClose} className="btn-primary w-full justify-center">
          I Understand
        </button>
      </div>
    </div>
  </div>
);

/* ── Terms of Service content ── */
const TermsContent = () => (
  <>
    <p className="text-xs text-gray-400">Last updated: April 2025</p>

    <section>
      <h3 className="font-semibold text-gray-900 mb-1">1. Acceptance of Terms</h3>
      <p>By creating an account and using JobPortal ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.</p>
    </section>

    <section>
      <h3 className="font-semibold text-gray-900 mb-1">2. Eligibility</h3>
      <p>You must be at least 16 years of age to use JobPortal. By registering, you confirm that you are at least 16 years old and that the information you provide is accurate and complete.</p>
    </section>

    <section>
      <h3 className="font-semibold text-gray-900 mb-1">3. User Accounts</h3>
      <ul className="list-disc list-inside space-y-1">
        <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
        <li>You agree not to share your account with any other person.</li>
        <li>You must notify us immediately of any unauthorized use of your account.</li>
        <li>JobPortal is not liable for any loss resulting from unauthorized use of your account.</li>
      </ul>
    </section>

    <section>
      <h3 className="font-semibold text-gray-900 mb-1">4. Acceptable Use</h3>
      <p>You agree not to:</p>
      <ul className="list-disc list-inside space-y-1 mt-1">
        <li>Post false, misleading, or fraudulent job listings or profiles.</li>
        <li>Harass, abuse, or harm other users of the Platform.</li>
        <li>Use automated tools (bots, scrapers) to access or collect data from the Platform.</li>
        <li>Violate any applicable local, national, or international law or regulation.</li>
        <li>Impersonate any person, company, or entity.</li>
      </ul>
    </section>

    <section>
      <h3 className="font-semibold text-gray-900 mb-1">5. Job Listings & Applications</h3>
      <p>JobPortal acts as an intermediary between job seekers and employers. We do not guarantee employment, interview calls, or placement. We are not responsible for the accuracy of job listings posted by employers. External application links may redirect you to third-party websites; we are not liable for content on those sites.</p>
    </section>

    <section>
      <h3 className="font-semibold text-gray-900 mb-1">6. Intellectual Property</h3>
      <p>All content on JobPortal, including logos, designs, text, and software, is the property of JobPortal or its licensors and is protected by intellectual property laws. You may not reproduce or distribute any content without our prior written permission.</p>
    </section>

    <section>
      <h3 className="font-semibold text-gray-900 mb-1">7. Termination</h3>
      <p>We reserve the right to suspend or terminate your account at any time, without notice, for conduct that violates these Terms or is otherwise harmful to other users, us, or third parties.</p>
    </section>

    <section>
      <h3 className="font-semibold text-gray-900 mb-1">8. Limitation of Liability</h3>
      <p>To the fullest extent permitted by law, JobPortal shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform or inability to use it.</p>
    </section>

    <section>
      <h3 className="font-semibold text-gray-900 mb-1">9. Changes to Terms</h3>
      <p>We may update these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the new Terms. We will notify registered users via email of significant changes.</p>
    </section>

    <section>
      <h3 className="font-semibold text-gray-900 mb-1">10. Contact Us</h3>
      <p>For any questions regarding these Terms, contact us at <a href="mailto:legal@jobportal.com" className="text-primary-600 hover:underline">legal@jobportal.com</a>.</p>
    </section>
  </>
);

/* ── Privacy Policy content ── */
const PrivacyContent = () => (
  <>
    <p className="text-xs text-gray-400">Last updated: April 2025</p>

    <section>
      <h3 className="font-semibold text-gray-900 mb-1">1. Information We Collect</h3>
      <p>When you register and use JobPortal, we collect the following types of information:</p>
      <ul className="list-disc list-inside space-y-1 mt-1">
        <li><strong>Account Information:</strong> Full name, email address, and password (stored securely as a hash).</li>
        <li><strong>Profile Information:</strong> Resume, skills, work experience, education, and profile photo (optional).</li>
        <li><strong>Usage Data:</strong> Pages visited, jobs viewed, search queries, and application history.</li>
        <li><strong>Device & Technical Data:</strong> IP address, browser type, operating system, and cookies.</li>
      </ul>
    </section>

    <section>
      <h3 className="font-semibold text-gray-900 mb-1">2. How We Use Your Information</h3>
      <ul className="list-disc list-inside space-y-1">
        <li>To create and manage your account.</li>
        <li>To match you with relevant job opportunities.</li>
        <li>To track and display your job applications.</li>
        <li>To send you job alerts and platform notifications (you can opt out).</li>
        <li>To improve platform features and user experience.</li>
        <li>To comply with legal obligations.</li>
      </ul>
    </section>

    <section>
      <h3 className="font-semibold text-gray-900 mb-1">3. Sharing Your Information</h3>
      <p>We do <strong>not</strong> sell your personal data. We may share your information only in these circumstances:</p>
      <ul className="list-disc list-inside space-y-1 mt-1">
        <li><strong>With Employers:</strong> When you apply to a job, your profile/application is shared with that employer.</li>
        <li><strong>Service Providers:</strong> Third-party services like email providers and cloud storage that help us operate the Platform (bound by confidentiality agreements).</li>
        <li><strong>Legal Requirements:</strong> When required by law, court order, or government authority.</li>
      </ul>
    </section>

    <section>
      <h3 className="font-semibold text-gray-900 mb-1">4. Cookies</h3>
      <p>We use cookies and similar technologies to keep you logged in, remember your preferences, and analyze usage patterns. You can disable cookies in your browser settings, but some features may not work correctly.</p>
    </section>

    <section>
      <h3 className="font-semibold text-gray-900 mb-1">5. Data Security</h3>
      <p>We implement industry-standard security measures including HTTPS encryption, hashed passwords (bcrypt), and access controls to protect your data. However, no method of transmission over the internet is 100% secure.</p>
    </section>

    <section>
      <h3 className="font-semibold text-gray-900 mb-1">6. Data Retention</h3>
      <p>We retain your data for as long as your account is active. You may request deletion of your account and associated data at any time by contacting us at <a href="mailto:privacy@jobportal.com" className="text-primary-600 hover:underline">privacy@jobportal.com</a>. Some data may be retained for legal compliance purposes.</p>
    </section>

    <section>
      <h3 className="font-semibold text-gray-900 mb-1">7. Your Rights</h3>
      <p>Depending on your location, you may have the following rights:</p>
      <ul className="list-disc list-inside space-y-1 mt-1">
        <li><strong>Access:</strong> Request a copy of the data we hold about you.</li>
        <li><strong>Correction:</strong> Request correction of inaccurate data.</li>
        <li><strong>Deletion:</strong> Request deletion of your personal data.</li>
        <li><strong>Portability:</strong> Request your data in a machine-readable format.</li>
        <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time.</li>
      </ul>
    </section>

    <section>
      <h3 className="font-semibold text-gray-900 mb-1">8. Third-Party Links</h3>
      <p>Our Platform may contain links to external websites (e.g., employer career pages). We are not responsible for the privacy practices of those sites. Please review their privacy policies before sharing any information.</p>
    </section>

    <section>
      <h3 className="font-semibold text-gray-900 mb-1">9. Changes to This Policy</h3>
      <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on the Platform. Continued use after changes constitutes acceptance.</p>
    </section>

    <section>
      <h3 className="font-semibold text-gray-900 mb-1">10. Contact Us</h3>
      <p>For privacy-related questions or requests, contact our Data Protection Officer at <a href="mailto:privacy@jobportal.com" className="text-primary-600 hover:underline">privacy@jobportal.com</a>.</p>
    </section>
  </>
);

/* ══════════════════════════════════════════════
   Main SignUpPage
══════════════════════════════════════════════ */
const SignUpPage = () => {
  const navigate   = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // 'terms' | 'privacy' | null
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) { toast.error('Passwords do not match!'); return; }
    setLoading(true);
    try {
      const res = await authService.register({
        fullName: data.fullName,
        email:    data.email,
        password: data.password,
      });
      toast.success('OTP sent! Please check your email.');
      navigate('/verify-otp', { state: { email: res.data.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex flex-col bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50 px-12 py-10 overflow-hidden">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 mb-8 flex-shrink-0">
          <BriefcaseBusiness size={30} className="text-primary-600" strokeWidth={1.8} />
          Job<span className="text-primary-600">Portal</span>
        </Link>
        <div className="mb-6 flex-shrink-0">
          <h2 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">
            Create your account &<br />
            <span className="text-gradient">start your journey</span>
          </h2>
          <p className="text-gray-500 text-sm">Join thousands of students finding the right opportunities.</p>
        </div>
        <div className="flex-1 flex items-center justify-center min-h-0 mb-6">
          <img src={heroIllustration} alt="Career illustration" className="w-full max-w-md object-contain" style={{ maxHeight: '300px' }} />
        </div>
        <div className="flex flex-col gap-3 flex-shrink-0">
          {FEATURES.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <span className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon size={15} />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex items-center justify-center px-6 py-10 bg-white">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center justify-center gap-2 font-bold text-xl text-gray-900 mb-5 lg:hidden">
            <BriefcaseBusiness size={28} className="text-primary-600" strokeWidth={1.8} />
            Job<span className="text-primary-600">Portal</span>
          </Link>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500 mt-1 text-sm">Sign up to get started for free</p>
          </div>

          <div className="card-p">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Full Name */}
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 mt-px text-gray-400" />
                  <input {...register('fullName', { required: 'Full name is required', minLength: { value: 2, message: 'Name too short' } })}
                    placeholder="Enter your full name"
                    className={`input pl-10 ${errors.fullName ? 'input-error' : ''}`} />
                </div>
                {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 mt-px text-gray-400" />
                  <input {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } })}
                    type="email" placeholder="Enter your email address"
                    className={`input pl-10 ${errors.email ? 'input-error' : ''}`} />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 mt-px text-gray-400" />
                  <input {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                    type={showPass ? 'text' : 'password'} placeholder="Create a password"
                    className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 mt-px text-gray-400" />
                  <input {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: val => val === password || 'Passwords do not match',
                  })}
                    type={showConfirm ? 'text' : 'password'} placeholder="Confirm your password"
                    className={`input pl-10 pr-10 ${errors.confirmPassword ? 'input-error' : ''}`} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
              </div>

              {/* Terms checkbox */}
              <div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input {...register('terms', { required: 'You must agree to the terms' })}
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-400 mt-0.5" />
                  <span className="text-sm text-gray-600">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setModal('terms'); }}
                      className="text-primary-600 hover:underline font-medium"
                    >
                      Terms of Service
                    </button>
                    {' '}and{' '}
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setModal('privacy'); }}
                      className="text-primary-600 hover:underline font-medium"
                    >
                      Privacy Policy
                    </button>
                  </span>
                </label>
                {errors.terms && <p className="text-xs text-red-500 mt-1">{errors.terms.message}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="text-sm text-gray-400 font-medium">OR</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Social */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href="http://localhost:5000/api/auth/google"
                className="btn-secondary border-gray-300 hover:bg-gray-50 text-sm gap-2 justify-center flex items-center shadow-sm"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                Google
              </a>
              <button className="btn-secondary border-gray-300 hover:bg-gray-50 text-sm gap-2 justify-center flex items-center shadow-sm opacity-50 cursor-not-allowed" disabled title="Coming soon">
                <img src="https://www.linkedin.com/favicon.ico" alt="LinkedIn" className="w-4 h-4" />
                LinkedIn
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-medium hover:underline">Log in</Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Legal Modals ── */}
      {modal === 'terms' && (
        <LegalModal title="Terms of Service" onClose={() => setModal(null)}>
          <TermsContent />
        </LegalModal>
      )}
      {modal === 'privacy' && (
        <LegalModal title="Privacy Policy" onClose={() => setModal(null)}>
          <PrivacyContent />
        </LegalModal>
      )}
    </div>
  );
};

export default SignUpPage;
