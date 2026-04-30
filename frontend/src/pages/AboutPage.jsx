import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, Briefcase, GraduationCap, ShieldCheck, UserCheck, Lightbulb, TrendingUp, Mail, Linkedin } from 'lucide-react';
import aboutIllustration from '../assets/about-illustration.png';

/* ── Static data ── */
const STATS = [
  { icon: Users,         color: 'bg-indigo-50 text-indigo-600',  value: '250K+', label: 'Active Users',         sub: 'Growing community' },
  { icon: Building2,     color: 'bg-indigo-50 text-indigo-600',  value: '15K+',  label: 'Partner Companies',    sub: 'Top hiring partners' },
  { icon: Briefcase,     color: 'bg-indigo-50 text-indigo-600',  value: '35K+',  label: 'Opportunities',        sub: 'Find the right fit' },
  { icon: GraduationCap, color: 'bg-indigo-50 text-indigo-600',  value: '8K+',   label: 'Internships',          sub: 'Kickstart your career' },
];

const VALUES = [
  { icon: ShieldCheck, color: 'text-indigo-500', title: 'Trust',     desc: 'We build trust through transparency, security and reliable connections.' },
  { icon: UserCheck,   color: 'text-green-500',  title: 'Inclusion', desc: 'We believe in equal opportunities for everyone, everywhere.' },
  { icon: Lightbulb,   color: 'text-orange-500', title: 'Innovation',desc: 'We continuously innovate to create better experiences for our users.' },
  { icon: TrendingUp,  color: 'text-blue-500',   title: 'Growth',    desc: 'We support continuous learning and career growth for all.' },
];

const AboutPage = () => {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="animate-fade-in">

      {/* ── Hero Section ── */}
      <section className="bg-white py-12 md:py-20 px-4 border-b border-gray-100">
        <div className="page-container">
          <div className="grid lg:grid-cols-2 gap-10 items-center">

            {/* Left: Text */}
            <div className="flex flex-col justify-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-semibold text-indigo-700 mb-6 w-fit">
                About Us
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-[1.25] mb-6 tracking-tight">
                Empowering careers,<br />building futures
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed max-w-md">
                JobPortal is designed to connect talented individuals with meaningful opportunities.
                Whether you're just starting out or taking the next big step, we're here to support your
                career journey every step of the way.
              </p>
            </div>

            {/* Right: Illustration */}
            <div className="flex items-center justify-center lg:justify-end">
              <img
                src={aboutIllustration}
                alt="Team working together illustration"
                className="w-full max-w-lg object-contain drop-shadow-xl"
                style={{ maxHeight: '380px' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {STATS.map(({ icon: Icon, color, value, label, sub }) => (
              <div key={label} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center flex-shrink-0 shadow-sm border border-indigo-100/50`}>
                  <Icon size={26} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</p>
                  <p className="text-sm font-bold text-gray-700 mt-0.5">{label}</p>
                  <p className="text-[13px] text-gray-500 mt-1 leading-snug">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission + Values ── */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="page-container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* Mission */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-semibold text-indigo-700 mb-6">
                Our Mission
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 leading-tight mb-5 tracking-tight">
                Helping you find the right<br />opportunities
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                We aim to bridge the gap between talent and opportunity by providing a seamless platform
                for job seekers and employers.
              </p>
              
              {showMore && (
                <div className="text-gray-600 text-[15px] leading-relaxed mb-8 space-y-4 animate-fade-in bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner">
                  <p>
                    <strong className="text-gray-900">For Candidates:</strong> JobPortal provides smart filtering, direct communication with recruiters, and career-building resources to help you land your dream job faster.
                  </p>
                  <p>
                    <strong className="text-gray-900">For Employers:</strong> We offer advanced candidate tracking, seamless job posting tools, and a massive pool of talented individuals ready to drive your business forward.
                  </p>
                  <p>
                    Whether it's your first internship or a senior executive role, our technology ensures that the right people meet the right companies at the exact right time.
                  </p>
                </div>
              )}
              
              <button 
                onClick={() => setShowMore(!showMore)}
                className="btn-outline px-6 py-3 rounded-xl text-sm font-bold shadow-sm"
              >
                {showMore ? 'Show Less' : 'Learn More'}
              </button>
            </div>

            {/* Values */}
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-8 tracking-tight">Our Core Values</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {VALUES.map(({ icon: Icon, color, title, desc }) => (
                  <div key={title} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
                    <div className={`w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4`}>
                      <Icon size={20} className={color} strokeWidth={2.5} />
                    </div>
                    <p className="font-bold text-gray-900 text-lg mb-2">{title}</p>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Meet the Creator ── */}
      <section className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="page-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 border border-indigo-200 rounded-full text-xs font-semibold text-indigo-700 mb-6">
              Our Story
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">
              Built from the ground up by a DevOps Engineer
            </h2>
            <p className="text-[17px] md:text-lg text-gray-600 leading-[1.8] mb-6 font-medium">
              JobPortal started as a passion project to bridge the gap between talented individuals and amazing companies. As a DevOps engineer, I wanted to build a platform that wasn't just functional, but lightning-fast, highly scalable, and beautifully designed.
            </p>
            <p className="text-[17px] md:text-lg text-gray-600 leading-[1.8] mb-10 font-medium">
              Every line of code in this platform reflects a commitment to open learning, community-driven development, and engineering excellence. I'm building this in public to share my journey and help others along the way.
            </p>
            <a 
              href="https://linkedin.com/in/sk0990670" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center gap-2.5 bg-[#0A66C2] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#004182] hover:scale-105 transition-all shadow-lg text-[15px]"
            >
              <Linkedin size={20} />
              Follow my journey on LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* ── Contact CTA Banner ── */}
      <section className="py-12 bg-white">
        <div className="page-container">
          <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-3xl shadow-sm px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Left: icon + text */}
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Mail size={24} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 mb-1">We're here to help</p>
                <p className="text-gray-500 font-medium">Have questions or feedback? We'd love to hear from you.</p>
              </div>
            </div>

            {/* Right: CTA */}
            <a 
              href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL || 'solosahej@gmail.com'}`} 
              className="btn-primary px-8 py-3.5 rounded-xl text-[15px] font-bold flex-shrink-0 shadow-md hover:shadow-lg"
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
