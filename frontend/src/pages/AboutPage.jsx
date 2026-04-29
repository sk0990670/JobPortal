import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, Briefcase, GraduationCap, ShieldCheck, UserCheck, Lightbulb, TrendingUp, Mail } from 'lucide-react';
import aboutIllustration from '../assets/about-illustration.png';

/* ── Static data ── */
const STATS = [
  { icon: Users,         color: 'bg-indigo-100 text-indigo-600',  value: '250K+', label: 'Active Users',         sub: 'Growing community of job seekers' },
  { icon: Building2,     color: 'bg-green-100 text-green-600',    value: '15K+',  label: 'Partner Companies',    sub: 'Top organizations hiring with us' },
  { icon: Briefcase,     color: 'bg-orange-100 text-orange-600',  value: '35K+',  label: 'Job Opportunities',    sub: 'Find the right job that fits you' },
  { icon: GraduationCap, color: 'bg-blue-100 text-blue-600',      value: '8K+',   label: 'Internships',          sub: 'Kickstart your career with internships' },
];

const VALUES = [
  { icon: ShieldCheck, color: 'text-indigo-500', title: 'Trust',     desc: 'We build trust through transparency, security and reliable connections.' },
  { icon: UserCheck,   color: 'text-green-500',  title: 'Inclusion', desc: 'We believe in equal opportunities for everyone, everywhere.' },
  { icon: Lightbulb,   color: 'text-orange-400', title: 'Innovation',desc: 'We continuously innovate to create better experiences for our users.' },
  { icon: TrendingUp,  color: 'text-blue-500',   title: 'Growth',    desc: 'We support continuous learning and career growth for all.' },
];

const AboutPage = () => {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="animate-fade-in">

      {/* ── Hero Section ── */}
      <section className="bg-white py-12 px-4 border-b border-gray-100">
        <div className="page-container">
          <div className="grid lg:grid-cols-2 gap-10 items-center">

            {/* Left: Text */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-medium text-indigo-600 mb-5">
                About Us
              </div>

              <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-5">
                Empowering careers,<br />building futures
              </h1>

              <p className="text-gray-600 leading-relaxed max-w-md">
                JobPortal is designed to connect talented individuals with meaningful opportunities.
                Whether you're just starting out or taking the next big step, we're here to support your
                career journey every step of the way.
              </p>
            </div>

            {/* Right: Illustration */}
            <div className="flex items-center justify-center">
              <img
                src={aboutIllustration}
                alt="Team working together illustration"
                className="w-full max-w-lg object-contain"
                style={{ maxHeight: '320px' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ icon: Icon, color, value, label, sub }) => (
              <div key={label} className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm font-semibold text-gray-700">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-snug">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission + Values ── */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="page-container">
          <div className="grid lg:grid-cols-2 gap-10">

            {/* Mission */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-medium text-indigo-600 mb-5">
                Our Mission
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 leading-tight mb-4">
                Helping you find the right<br />opportunities
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                We aim to bridge the gap between talent and opportunity by providing a seamless platform
                for job seekers and employers.
              </p>
              
              {showMore && (
                <div className="text-gray-600 text-sm leading-relaxed mb-6 space-y-3 animate-fade-in bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p>
                    <strong>For Candidates:</strong> JobPortal provides smart filtering, direct communication with recruiters, and career-building resources to help you land your dream job faster.
                  </p>
                  <p>
                    <strong>For Employers:</strong> We offer advanced candidate tracking, seamless job posting tools, and a massive pool of talented individuals ready to drive your business forward.
                  </p>
                  <p>
                    Whether it's your first internship or a senior executive role, our technology ensures that the right people meet the right companies at the exact right time.
                  </p>
                </div>
              )}
              
              <button 
                onClick={() => setShowMore(!showMore)}
                className="btn-outline px-5 py-2.5 rounded-xl text-sm font-medium"
              >
                {showMore ? 'Show Less' : 'Learn More'}
              </button>
            </div>

          {/* Values */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Our Values</h2>
            <div className="grid grid-cols-2 gap-5">
              {VALUES.map(({ icon: Icon, color, title, desc }) => (
                <div key={title}>
                  <div className={`w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center mb-2`}>
                    <Icon size={18} className={color} />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">{title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── Contact CTA Banner ── */}
    <section className="py-8 bg-white">
      <div className="page-container">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: icon + text */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail size={22} className="text-indigo-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">We're here to help</p>
              <p className="text-sm text-gray-500">Have questions or feedback? We'd love to hear from you.</p>
            </div>
          </div>

          {/* Right: CTA */}
          <a 
            href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL || 'solosahej@gmail.com'}`} 
            className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>

  </div>
  );
};

export default AboutPage;
