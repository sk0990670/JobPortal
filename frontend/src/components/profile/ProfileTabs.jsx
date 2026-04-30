import { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';

const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
const DEGREE_TYPES = ['10th (Secondary)', '12th (Senior Secondary)', 'Diploma', "Bachelor's (B.Tech/B.E/B.Sc/BCA)", "Master's (M.Tech/M.Sc/MCA/MBA)", 'PhD', 'Other'];
const STREAMS = ['PCM (Physics, Chemistry, Math)', 'PCB (Physics, Chemistry, Biology)', 'Commerce', 'Arts/Humanities', 'Computer Science (CSE)', 'Information Technology (IT)', 'Electronics (ECE)', 'Mechanical', 'Civil', 'Electrical', 'Data Science', 'Other'];

/* ─── EMPTY FORMS ─── */
const emptyEdu  = { institution: '', degree: '', field: '', stream: '', startYear: '', endYear: '', current: false, grade: '' };
const emptyExp  = { role: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' };
const emptyProj = { title: '', description: '', techStack: '', link: '', startDate: '', endDate: '' };
const emptyCert = { name: '', issuer: '', issueDate: '', expiryDate: '', credentialId: '', url: '' };

/* ─── SKILLS TAB ─── */
export const SkillsTab = ({ profile, formData, setFormData, isEditing }) => {
  const [input, setInput] = useState('');
  const skills = isEditing ? (formData.skills ?? profile?.skills ?? []) : (profile?.skills || []);
  const addSkill = () => {
    const newSkills = input.split(',').map(s => s.trim()).filter(Boolean);
    if (!newSkills.length) return;
    setFormData(p => ({ ...p, skills: [...(p.skills ?? profile?.skills ?? []), ...newSkills] }));
    setInput('');
  };
  const removeSkill = (i) => setFormData(p => ({ ...p, skills: skills.filter((_, idx) => idx !== i) }));

  return (
    <div className="card-p">
      <h3 className="font-semibold text-gray-900 mb-4">Skills</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {skills.map((s, i) => (
          <span key={i} className="flex items-center gap-1 bg-primary-50 text-primary-700 border border-primary-200 text-sm px-3 py-1 rounded-full">
            {s}
            {isEditing && <button onClick={() => removeSkill(i)}><X size={12} /></button>}
          </span>
        ))}
        {!skills.length && <p className="text-sm text-gray-400">No skills added yet.</p>}
      </div>
      {isEditing && (
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSkill()}
            placeholder="e.g. Python, React, SQL (press Enter or click Add)"
            className="input flex-1" />
          <button onClick={addSkill} className="btn-primary px-4">Add</button>
        </div>
      )}
    </div>
  );
};

/* ─── EDUCATION TAB ─── */
export const EducationTab = ({ profile, formData, setFormData, isEditing }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyEdu);
  const list = isEditing ? (formData.education ?? profile?.education ?? []) : (profile?.education || []);

  const add = () => {
    if (!form.institution || !form.degree) return;
    setFormData(p => ({ ...p, education: [...(p.education ?? profile?.education ?? []), form] }));
    setForm(emptyEdu); setShowForm(false);
  };
  const remove = (i) => setFormData(p => ({ ...p, education: list.filter((_, idx) => idx !== i) }));
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="card-p space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Education</h3>
        {isEditing && !showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary btn-sm gap-1"><Plus size={13} />Add</button>
        )}
      </div>

      {/* Add Form */}
      {isEditing && showForm && (
        <div className="border border-primary-200 rounded-xl p-4 bg-primary-50 space-y-3">
          <h4 className="font-medium text-gray-800 text-sm">New Education</h4>
          <div>
            <label className="label">Institution Name *</label>
            <input className="input" value={form.institution} onChange={e => f('institution', e.target.value)} placeholder="e.g. Delhi Public School / IIT Delhi" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Degree / Level *</label>
              <select className="input" value={form.degree} onChange={e => f('degree', e.target.value)}>
                <option value="">Select degree</option>
                {DEGREE_TYPES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Stream / Specialization</label>
              <select className="input" value={form.stream} onChange={e => f('stream', e.target.value)}>
                <option value="">Select stream</option>
                {STREAMS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Field / Subject (optional)</label>
            <input className="input" value={form.field} onChange={e => f('field', e.target.value)} placeholder="e.g. Computer Science, Mathematics" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Start Year</label>
              <select className="input" value={form.startYear} onChange={e => f('startYear', e.target.value)}>
                <option value="">Year</option>
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="label">End Year</label>
              <select className="input" value={form.endYear} onChange={e => f('endYear', e.target.value)} disabled={form.current}>
                <option value="">Year</option>
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Grade / %</label>
              <input className="input" value={form.grade} onChange={e => f('grade', e.target.value)} placeholder="e.g. 85% / 8.5 CGPA" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={form.current} onChange={e => f('current', e.target.checked)} />
            Currently studying here
          </label>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setShowForm(false)} className="btn-secondary btn-sm">Cancel</button>
            <button onClick={add} className="btn-primary btn-sm">Save Education</button>
          </div>
        </div>
      )}

      {/* List */}
      {list.length === 0 && !showForm && <p className="text-sm text-gray-400">No education added yet. Click Add to get started.</p>}
      {list.map((edu, i) => (
        <div key={i} className="flex items-start gap-3 border-l-4 border-primary-300 pl-4 py-1">
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{edu.institution}</p>
            <p className="text-sm text-gray-600">{edu.degree}{edu.stream ? ` · ${edu.stream}` : ''}{edu.field ? ` · ${edu.field}` : ''}</p>
            <p className="text-xs text-gray-400 mt-0.5">{edu.startYear} – {edu.current ? 'Present' : edu.endYear}{edu.grade ? ` · ${edu.grade}` : ''}</p>
          </div>
          {isEditing && <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>}
        </div>
      ))}
    </div>
  );
};

/* ─── EXPERIENCE TAB ─── */
export const ExperienceTab = ({ profile, formData, setFormData, isEditing }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyExp);
  const list = isEditing ? (formData.experience ?? profile?.experience ?? []) : (profile?.experience || []);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const add = () => {
    if (!form.role || !form.company) return;
    setFormData(p => ({ ...p, experience: [...(p.experience ?? profile?.experience ?? []), form] }));
    setForm(emptyExp); setShowForm(false);
  };
  const remove = (i) => setFormData(p => ({ ...p, experience: list.filter((_, idx) => idx !== i) }));

  return (
    <div className="card-p space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Experience</h3>
        {isEditing && !showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary btn-sm gap-1"><Plus size={13} />Add</button>
        )}
      </div>

      {isEditing && showForm && (
        <div className="border border-green-200 rounded-xl p-4 bg-green-50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Job Title *</label>
              <input className="input" value={form.role} onChange={e => f('role', e.target.value)} placeholder="e.g. Software Engineer Intern" />
            </div>
            <div>
              <label className="label">Company *</label>
              <input className="input" value={form.company} onChange={e => f('company', e.target.value)} placeholder="e.g. Google" />
            </div>
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={e => f('location', e.target.value)} placeholder="e.g. Bangalore, Remote" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Date</label>
              <input type="month" className="input" value={form.startDate} onChange={e => f('startDate', e.target.value)} />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="month" className="input" value={form.endDate} onChange={e => f('endDate', e.target.value)} disabled={form.current} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.current} onChange={e => f('current', e.target.checked)} />
            Currently working here
          </label>
          <div>
            <label className="label">Description</label>
            <textarea rows={3} className="input resize-none" value={form.description} onChange={e => f('description', e.target.value)} placeholder="Describe your responsibilities and achievements..." />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="btn-secondary btn-sm">Cancel</button>
            <button onClick={add} className="btn-primary btn-sm">Save Experience</button>
          </div>
        </div>
      )}

      {list.length === 0 && !showForm && <p className="text-sm text-gray-400">No experience added yet.</p>}
      {list.map((exp, i) => (
        <div key={i} className="flex items-start gap-3 border-l-4 border-green-300 pl-4 py-1">
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{exp.role}</p>
            <p className="text-sm text-gray-600">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
            <p className="text-xs text-gray-400 mt-0.5">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</p>
            {exp.description && <p className="text-xs text-gray-600 mt-1 leading-relaxed">{exp.description}</p>}
          </div>
          {isEditing && <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>}
        </div>
      ))}
    </div>
  );
};

/* ─── PROJECTS TAB ─── */
export const ProjectsTab = ({ profile, formData, setFormData, isEditing }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyProj);
  const list = isEditing ? (formData.projects ?? profile?.projects ?? []) : (profile?.projects || []);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const add = () => {
    if (!form.title) return;
    setFormData(p => ({ ...p, projects: [...(p.projects ?? profile?.projects ?? []), form] }));
    setForm(emptyProj); setShowForm(false);
  };
  const remove = (i) => setFormData(p => ({ ...p, projects: list.filter((_, idx) => idx !== i) }));

  return (
    <div className="card-p space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Projects</h3>
        {isEditing && !showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary btn-sm gap-1"><Plus size={13} />Add</button>
        )}
      </div>

      {isEditing && showForm && (
        <div className="border border-purple-200 rounded-xl p-4 bg-purple-50 space-y-3">
          <div>
            <label className="label">Project Title *</label>
            <input className="input" value={form.title} onChange={e => f('title', e.target.value)} placeholder="e.g. JobPortal MERN App" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={3} className="input resize-none" value={form.description} onChange={e => f('description', e.target.value)} placeholder="What does this project do?" />
          </div>
          <div>
            <label className="label">Tech Stack</label>
            <input className="input" value={form.techStack} onChange={e => f('techStack', e.target.value)} placeholder="e.g. React, Node.js, MongoDB" />
          </div>
          <div>
            <label className="label">Project Link (GitHub / Live)</label>
            <input className="input" value={form.link} onChange={e => f('link', e.target.value)} placeholder="https://github.com/..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Start</label><input type="month" className="input" value={form.startDate} onChange={e => f('startDate', e.target.value)} /></div>
            <div><label className="label">End</label><input type="month" className="input" value={form.endDate} onChange={e => f('endDate', e.target.value)} /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="btn-secondary btn-sm">Cancel</button>
            <button onClick={add} className="btn-primary btn-sm">Save Project</button>
          </div>
        </div>
      )}

      {list.length === 0 && !showForm && <p className="text-sm text-gray-400">No projects added yet.</p>}
      {list.map((proj, i) => (
        <div key={i} className="flex items-start gap-3 border-l-4 border-purple-300 pl-4 py-1">
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{proj.title}</p>
            {proj.techStack && <p className="text-xs text-primary-600 font-medium mt-0.5">{proj.techStack}</p>}
            {proj.description && <p className="text-xs text-gray-600 mt-1">{proj.description}</p>}
            {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">{proj.link}</a>}
          </div>
          {isEditing && <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>}
        </div>
      ))}
    </div>
  );
};

/* ─── CERTIFICATES TAB ─── */
export const CertificatesTab = ({ profile, formData, setFormData, isEditing }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyCert);
  const list = isEditing ? (formData.certifications ?? profile?.certifications ?? []) : (profile?.certifications || []);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const add = () => {
    if (!form.name) return;
    setFormData(p => ({ ...p, certifications: [...(p.certifications ?? profile?.certifications ?? []), form] }));
    setForm(emptyCert); setShowForm(false);
  };
  const remove = (i) => setFormData(p => ({ ...p, certifications: list.filter((_, idx) => idx !== i) }));

  return (
    <div className="card-p space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Certifications</h3>
        {isEditing && !showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary btn-sm gap-1"><Plus size={13} />Add</button>
        )}
      </div>

      {isEditing && showForm && (
        <div className="border border-orange-200 rounded-xl p-4 bg-orange-50 space-y-3">
          <div>
            <label className="label">Certificate Name *</label>
            <input className="input" value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. AWS Certified Solutions Architect" />
          </div>
          <div>
            <label className="label">Issuing Organization</label>
            <input className="input" value={form.issuer} onChange={e => f('issuer', e.target.value)} placeholder="e.g. Amazon Web Services" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Issue Date</label><input type="month" className="input" value={form.issueDate} onChange={e => f('issueDate', e.target.value)} /></div>
            <div><label className="label">Expiry Date</label><input type="month" className="input" value={form.expiryDate} onChange={e => f('expiryDate', e.target.value)} /></div>
          </div>
          <div>
            <label className="label">Credential ID</label>
            <input className="input" value={form.credentialId} onChange={e => f('credentialId', e.target.value)} placeholder="e.g. ABC-12345" />
          </div>
          <div>
            <label className="label">Credential URL</label>
            <input className="input" value={form.url} onChange={e => f('url', e.target.value)} placeholder="https://credential.link/..." />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="btn-secondary btn-sm">Cancel</button>
            <button onClick={add} className="btn-primary btn-sm">Save Certificate</button>
          </div>
        </div>
      )}

      {list.length === 0 && !showForm && <p className="text-sm text-gray-400">No certificates added yet.</p>}
      {list.map((cert, i) => (
        <div key={i} className="flex items-start gap-3 border-l-4 border-orange-300 pl-4 py-1">
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{cert.name}</p>
            {cert.issuer && <p className="text-sm text-gray-600">{cert.issuer}</p>}
            <p className="text-xs text-gray-400 mt-0.5">{cert.issueDate}{cert.expiryDate ? ` → ${cert.expiryDate}` : ''}</p>
            {cert.url && <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">View Credential</a>}
          </div>
          {isEditing && <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>}
        </div>
      ))}
    </div>
  );
};

/* ─── PREFERENCES TAB ─── */
export const PreferencesTab = ({ profile, formData, setFormData, isEditing }) => {
  const prefs = isEditing ? (formData.preferences ?? profile?.preferences ?? {}) : (profile?.preferences || {});
  const f = (k, v) => setFormData(p => ({ ...p, preferences: { ...(p.preferences ?? profile?.preferences ?? {}), [k]: v } }));

  const Row = ({ label, field, options, isTopLevel }) => {
    const value = isTopLevel 
      ? (isEditing ? (formData[field] ?? profile?.[field]) : profile?.[field])
      : (prefs[field] || '');
      
    const handleChange = (e) => {
      if (isTopLevel) {
        setFormData(p => ({ ...p, [field]: e.target.value }));
      } else {
        f(field, e.target.value);
      }
    };

    return (
      <div>
        <label className="label">{label}</label>
        {isEditing ? (
          <select className="input" value={value || ''} onChange={handleChange}>
            <option value="">Select…</option>
            {options.map(o => <option key={o}>{o}</option>)}
          </select>
        ) : <p className="text-sm font-medium text-gray-900">{value || '—'}</p>}
      </div>
    );
  };

  return (
    <div className="card-p space-y-5">
      <h3 className="font-semibold text-gray-900">Job Preferences</h3>
      <div className="grid grid-cols-2 gap-4">
        <Row label="Preferred Role" field="preferredRole" options={['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'DevOps Engineer', 'ML Engineer', 'Mobile Developer', 'UI/UX Designer', 'Other']} />
        <Row label="Work Mode" field="workMode" options={['Remote', 'On-site', 'Hybrid', 'Any']} />
        <Row label="Job Type" field="jobType" options={['Full-time', 'Part-time', 'Internship', 'Freelance', 'Contract']} />
        <Row label="Preferred Location" field="preferredLocation" options={['Bangalore', 'Mumbai', 'Delhi/NCR', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Remote (Any)', 'Open to relocation']} />
        <Row label="Expected Salary (LPA)" field="expectedSalary" options={['0–3 LPA', '3–6 LPA', '6–10 LPA', '10–15 LPA', '15–25 LPA', '25+ LPA']} />
        <Row label="Notice Period" field="noticePeriod" options={['Immediate', '15 days', '1 month', '2 months', '3 months']} isTopLevel={true} />
      </div>
      {isEditing && (
        <div>
          <label className="label">Skills you want to work with</label>
          <input className="input" value={prefs.desiredSkills || ''} onChange={e => f('desiredSkills', e.target.value)} placeholder="e.g. React, Python, Kubernetes" />
        </div>
      )}
      {!isEditing && prefs.desiredSkills && (
        <div>
          <p className="label">Desired Skills</p>
          <p className="text-sm text-gray-900">{prefs.desiredSkills}</p>
        </div>
      )}
    </div>
  );
};
