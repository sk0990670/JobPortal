import { Link } from 'react-router-dom';
import { FileText, Users, Briefcase, Copyright, AlertTriangle, Mail, Shield, XCircle } from 'lucide-react';

const LAST_UPDATED = 'May 2025';

const SECTIONS = [
  {
    id: 'acceptance',
    icon: FileText,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    title: '1. Acceptance of Terms',
    content: (
      <p className="text-gray-600 leading-relaxed">
        By creating an account and using JobPortal ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. These terms apply to all visitors, users, and others who access or use the Platform.
      </p>
    ),
  },
  {
    id: 'eligibility',
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    title: '2. Eligibility',
    content: (
      <p className="text-gray-600 leading-relaxed">
        You must be at least <strong className="text-gray-900">16 years of age</strong> to use JobPortal. By registering, you confirm that you are at least 16 years old and that the information you provide is accurate and complete. If you are under 18, you represent that a parent or guardian has reviewed and agreed to these terms.
      </p>
    ),
  },
  {
    id: 'accounts',
    icon: Shield,
    color: 'text-green-600',
    bg: 'bg-green-50',
    title: '3. User Accounts',
    content: (
      <ul className="space-y-3">
        {[
          'You are responsible for maintaining the confidentiality of your login credentials.',
          'You agree not to share your account with any other person.',
          'You must notify us immediately of any unauthorized use of your account.',
          'JobPortal is not liable for any loss resulting from unauthorized use of your account.',
          'You may sign in via email/password, Google, or LinkedIn. Each method creates the same account type.',
        ].map((item) => (
          <li key={item} className="flex gap-3 text-gray-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: 'acceptable-use',
    icon: AlertTriangle,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    title: '4. Acceptable Use',
    content: (
      <>
        <p className="text-gray-600 mb-4">You agree not to:</p>
        <ul className="space-y-3">
          {[
            'Post false, misleading, or fraudulent job listings or profiles.',
            'Harass, abuse, or harm other users of the Platform.',
            'Use automated tools (bots, scrapers) to access or collect data from the Platform.',
            'Violate any applicable local, national, or international law or regulation.',
            'Impersonate any person, company, or entity.',
            'Upload malicious files, viruses, or any software that could damage the Platform.',
            'Attempt to gain unauthorized access to any part of the Platform.',
          ].map((item) => (
            <li key={item} className="flex gap-3 text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: 'job-listings',
    icon: Briefcase,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    title: '5. Job Listings & Applications',
    content: (
      <p className="text-gray-600 leading-relaxed">
        JobPortal acts as an intermediary between job seekers and employers. We do <strong className="text-gray-900">not</strong> guarantee employment, interview calls, or placement. We are not responsible for the accuracy of job listings posted by employers. External application links may redirect you to third-party websites; we are not liable for content on those sites.
      </p>
    ),
  },
  {
    id: 'ip',
    icon: Copyright,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    title: '6. Intellectual Property',
    content: (
      <p className="text-gray-600 leading-relaxed">
        All content on JobPortal — including logos, designs, text, and software — is the property of JobPortal or its licensors and is protected by intellectual property laws. You may not reproduce or distribute any content without our prior written permission. User-generated content (e.g., resumes, profiles) remains the property of the respective user.
      </p>
    ),
  },
  {
    id: 'privacy',
    icon: Shield,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    title: '7. Privacy',
    content: (
      <p className="text-gray-600 leading-relaxed">
        Your use of JobPortal is also governed by our{' '}
        <Link to="/privacy" className="text-indigo-600 hover:underline font-medium">Privacy Policy</Link>,
        which is incorporated into these Terms by reference. Please review it carefully to understand how we collect and use your personal information.
      </p>
    ),
  },
  {
    id: 'termination',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    title: '8. Termination',
    content: (
      <p className="text-gray-600 leading-relaxed">
        We reserve the right to suspend or terminate your account at any time, without notice, for conduct that violates these Terms or is otherwise harmful to other users, us, or third parties. You may also delete your account at any time from your Settings page.
      </p>
    ),
  },
  {
    id: 'liability',
    icon: AlertTriangle,
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    title: '9. Limitation of Liability',
    content: (
      <p className="text-gray-600 leading-relaxed">
        To the fullest extent permitted by law, JobPortal shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform or inability to use it. Our total liability to you shall not exceed the amount paid (if any) by you for access to the Platform in the twelve months preceding the claim.
      </p>
    ),
  },
  {
    id: 'changes',
    icon: FileText,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    title: '10. Changes to Terms',
    content: (
      <p className="text-gray-600 leading-relaxed">
        We may update these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the new Terms. We will notify registered users via email of significant changes. The date at the top of this page reflects the most recent update.
      </p>
    ),
  },
];

const TermsOfServicePage = () => (
  <div className="animate-fade-in">

    {/* ── Hero Banner ── */}
    <section className="bg-gradient-to-br from-gray-50 via-white to-indigo-50 border-b border-gray-100 py-16 px-4">
      <div className="page-container max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 border border-indigo-200 rounded-full text-xs font-semibold text-indigo-700 mb-6">
          <FileText size={13} />
          Legal
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Terms of Service
        </h1>
        <p className="text-lg text-gray-500 font-medium mb-3">
          Please read these terms carefully before using JobPortal.
        </p>
        <p className="text-sm text-gray-400">Last updated: {LAST_UPDATED}</p>
      </div>
    </section>

    {/* ── Content ── */}
    <section className="py-14 bg-white">
      <div className="page-container max-w-4xl mx-auto">

        {/* Quick Nav */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-12">
          <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Table of Contents</p>
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
              <div>{content}</div>
            </div>
          ))}
        </div>

        {/* Contact Block */}
        <div className="mt-14 bg-gradient-to-r from-gray-50 to-indigo-50 border border-gray-100 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail size={22} className="text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Questions about these terms?</h3>
          <p className="text-gray-500 mb-5 font-medium">
            Reach out to our legal team and we'll get back to you within 48 hours.
          </p>
          <a
            href="mailto:sk0990670+legal@gmail.com"
            className="btn-primary px-8 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2"
          >
            <Mail size={15} />
            Legal Mail
          </a>
        </div>

        {/* Footer Nav */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          <Link to="/about" className="hover:text-indigo-600 font-medium transition-colors">About Us</Link>
          <Link to="/privacy" className="hover:text-indigo-600 font-medium transition-colors">Privacy Policy</Link>
          <Link to="/" className="hover:text-indigo-600 font-medium transition-colors">Back to Home</Link>
        </div>

      </div>
    </section>
  </div>
);

export default TermsOfServicePage;
