import { Link } from 'react-router-dom';
import { Shield, Eye, Lock, Trash2, Mail, Database, Globe, UserCheck } from 'lucide-react';

const LAST_UPDATED = 'May 2025';

const SECTIONS = [
  {
    id: 'information-we-collect',
    icon: Database,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    title: '1. Information We Collect',
    content: (
      <>
        <p className="text-gray-600 mb-4">When you register and use JobPortal, we collect the following types of information:</p>
        <ul className="space-y-3">
          {[
            { label: 'Account Information', desc: 'Full name, email address, and password (stored securely as a bcrypt hash).' },
            { label: 'Profile Information', desc: 'Resume, skills, work experience, education, and profile photo (optional).' },
            { label: 'OAuth Data', desc: 'If you sign in with Google or LinkedIn, we receive your name, email, and profile photo from those services.' },
            { label: 'Usage Data', desc: 'Pages visited, jobs viewed, search queries, and application history.' },
            { label: 'Device & Technical Data', desc: 'IP address, browser type, operating system, and cookies.' },
          ].map(({ label, desc }) => (
            <li key={label} className="flex gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
              <span><strong className="text-gray-900">{label}:</strong> <span className="text-gray-600">{desc}</span></span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: 'how-we-use',
    icon: Eye,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    title: '2. How We Use Your Information',
    content: (
      <ul className="space-y-3">
        {[
          'To create and manage your account.',
          'To match you with relevant job and internship opportunities.',
          'To track and display your job applications.',
          'To send you job alerts and platform notifications (you can opt out).',
          'To improve platform features and user experience.',
          'To comply with legal obligations.',
        ].map((item) => (
          <li key={item} className="flex gap-3 text-gray-600">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: 'sharing',
    icon: Globe,
    color: 'text-green-600',
    bg: 'bg-green-50',
    title: '3. Sharing Your Information',
    content: (
      <>
        <p className="text-gray-600 mb-4">We do <strong className="text-gray-900">not</strong> sell your personal data. We may share your information only in these circumstances:</p>
        <ul className="space-y-3">
          {[
            { label: 'With Employers', desc: 'When you apply to a job, your profile/application is shared with that employer.' },
            { label: 'Service Providers', desc: 'Third-party services like email providers and cloud storage that help us operate the platform (bound by confidentiality agreements).' },
            { label: 'Legal Requirements', desc: 'When required by law, court order, or government authority.' },
          ].map(({ label, desc }) => (
            <li key={label} className="flex gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
              <span><strong className="text-gray-900">{label}:</strong> <span className="text-gray-600">{desc}</span></span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: 'oauth',
    icon: UserCheck,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    title: '4. Third-Party OAuth (Google & LinkedIn)',
    content: (
      <>
        <p className="text-gray-600 mb-4">When you choose to sign in using Google or LinkedIn, we access only the basic profile information those services provide (name, email, profile photo). We do not access your contacts, posts, or private messages.</p>
        <ul className="space-y-3">
          {[
            'We use your Google/LinkedIn email as your unique account identifier.',
            'Your OAuth provider credentials are never stored — only a unique ID returned by the provider.',
            'You may disconnect your OAuth account at any time from your Settings page.',
          ].map((item) => (
            <li key={item} className="flex gap-3 text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: 'cookies',
    icon: Lock,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    title: '5. Cookies',
    content: (
      <p className="text-gray-600 leading-relaxed">
        We use cookies and similar technologies to keep you logged in (via JWT tokens stored in localStorage), remember your preferences, and analyze usage patterns. You can disable cookies in your browser settings, but some features may not work correctly.
      </p>
    ),
  },
  {
    id: 'security',
    icon: Shield,
    color: 'text-red-600',
    bg: 'bg-red-50',
    title: '6. Data Security',
    content: (
      <p className="text-gray-600 leading-relaxed">
        We implement industry-standard security measures including HTTPS encryption, bcrypt-hashed passwords, JWT-based authentication, rate limiting, and access controls to protect your data. However, no method of transmission over the internet is 100% secure.
      </p>
    ),
  },
  {
    id: 'retention',
    icon: Database,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    title: '7. Data Retention',
    content: (
      <p className="text-gray-600 leading-relaxed">
        We retain your data for as long as your account is active. You may request deletion of your account and associated data at any time by contacting our{' '}
        <a href="mailto:sk0990670+privacy@gmail.com" className="text-indigo-600 hover:underline font-medium">Privacy Mail</a>.
        Some data may be retained for legal compliance purposes.
      </p>
    ),
  },
  {
    id: 'rights',
    icon: UserCheck,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    title: '8. Your Rights',
    content: (
      <>
        <p className="text-gray-600 mb-4">Depending on your location, you may have the following rights:</p>
        <ul className="space-y-3">
          {[
            { label: 'Access', desc: 'Request a copy of the data we hold about you.' },
            { label: 'Correction', desc: 'Request correction of inaccurate data via your Profile page.' },
            { label: 'Deletion', desc: 'Request deletion of your personal data by contacting us.' },
            { label: 'Portability', desc: 'Request your data in a machine-readable format.' },
            { label: 'Opt-out', desc: 'Unsubscribe from marketing communications at any time via Settings.' },
          ].map(({ label, desc }) => (
            <li key={label} className="flex gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
              <span><strong className="text-gray-900">{label}:</strong> <span className="text-gray-600">{desc}</span></span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: 'deletion',
    icon: Trash2,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    title: '9. Account Deletion',
    content: (
      <p className="text-gray-600 leading-relaxed">
        You can request account deletion at any time by going to <strong className="text-gray-900">Settings → Account → Delete Account</strong> or by emailing our{' '}
        <a href="mailto:sk0990670+privacy@gmail.com" className="text-indigo-600 hover:underline font-medium">Privacy Mail</a>.
        Upon deletion, your personal data will be permanently removed within 30 days, except where retention is required by law.
      </p>
    ),
  },
  {
    id: 'changes',
    icon: Eye,
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    title: '10. Changes to This Policy',
    content: (
      <p className="text-gray-600 leading-relaxed">
        We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on the platform. Continued use after changes constitutes acceptance. The date at the top of this page will always reflect the most recent update.
      </p>
    ),
  },
];

const PrivacyPolicyPage = () => (
  <div className="animate-fade-in">

    {/* ── Hero Banner ── */}
    <section className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 border-b border-gray-100 py-16 px-4">
      <div className="page-container max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 border border-indigo-200 rounded-full text-xs font-semibold text-indigo-700 mb-6">
          <Shield size={13} />
          Legal
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Privacy Policy
        </h1>
        <p className="text-lg text-gray-500 font-medium mb-3">
          We take your privacy seriously. Here's what we collect, why, and how we protect it.
        </p>
        <p className="text-sm text-gray-400">Last updated: {LAST_UPDATED}</p>
      </div>
    </section>

    {/* ── Content ── */}
    <section className="py-14 bg-white">
      <div className="page-container max-w-4xl mx-auto">

        {/* Quick Nav */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-12">
          <p className="text-sm font-bold text-indigo-800 mb-3 uppercase tracking-wide">Table of Contents</p>
          <div className="grid sm:grid-cols-2 gap-1.5">
            {SECTIONS.map(({ id, title }) => (
              <a
                key={id}
                href={`#${id}`}
                className="text-sm text-indigo-700 hover:text-indigo-900 hover:underline font-medium transition-colors"
              >
                {title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {SECTIONS.map(({ id, icon: Icon, color, bg, title, content }) => (
            <div
              key={id}
              id={id}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm p-7 scroll-mt-24"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon size={20} className={color} strokeWidth={2} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              </div>
              <div className="pl-0">{content}</div>
            </div>
          ))}
        </div>

        {/* Contact Block */}
        <div className="mt-14 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail size={22} className="text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Questions about your privacy?</h3>
          <p className="text-gray-500 mb-5 font-medium">
            Contact our Data Protection team and we'll get back to you within 48 hours.
          </p>
          <a
            href="mailto:sk0990670+privacy@gmail.com"
            className="btn-primary px-8 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2"
          >
            <Mail size={15} />
            Privacy Mail
          </a>
        </div>

        {/* Footer Nav */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          <Link to="/about" className="hover:text-indigo-600 font-medium transition-colors">About Us</Link>
          <Link to="/terms" className="hover:text-indigo-600 font-medium transition-colors">Terms of Service</Link>
          <Link to="/" className="hover:text-indigo-600 font-medium transition-colors">Back to Home</Link>
        </div>

      </div>
    </section>
  </div>
);

export default PrivacyPolicyPage;
