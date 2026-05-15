import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { BriefcaseBusiness } from 'lucide-react';

const FOOTER_LINKS = [
  {
    heading: 'Explore',
    links: [
      { label: 'Jobs',        to: '/jobs' },
      { label: 'Internships', to: '/internships' },
      { label: 'Companies',   to: '/companies' },
      { label: 'Resources',   to: '/resources' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us',  to: '/about' },
      { label: 'Contact',   href: 'mailto:solosahej@gmail.com' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy',   to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
    ],
  },
];

const MainLayout = () => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>

    {/* ── Footer ── */}
    <footer className="bg-white border-t border-gray-100 mt-8">

      {/* Main footer grid */}
      <div className="page-container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand col */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 mb-3">
              <BriefcaseBusiness size={26} className="text-primary-600" strokeWidth={1.8} />
              Job<span className="text-primary-600">Portal</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Connecting talent with opportunity. Find internships and jobs at top companies.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map(({ heading, links }) => (
            <div key={heading}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{heading}</p>
              <ul className="space-y-2.5">
                {links.map(({ label, to, href }) => (
                  <li key={label}>
                    {to ? (
                      <Link
                        to={to}
                        className="text-sm text-gray-500 hover:text-primary-600 font-medium transition-colors"
                      >
                        {label}
                      </Link>
                    ) : (
                      <a
                        href={href}
                        className="text-sm text-gray-500 hover:text-primary-600 font-medium transition-colors"
                      >
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100">
        <div className="page-container py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} JobPortal. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

    </footer>
  </div>
);

export default MainLayout;

