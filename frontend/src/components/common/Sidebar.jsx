import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Bookmark, User, Settings,
  LogOut, Building2, Briefcase, BookOpen, PlusCircle, Shield, X
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import { getInitials, getAvatarUrl } from '../../utils/formatters';

const userNavItems = [
  {
    title: 'MAIN MENU',
    items: [
      { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/applications', icon: FileText,         label: 'My Applications' },
      { to: '/saved-jobs',   icon: Bookmark,         label: 'Saved Jobs' },
    ]
  },
  {
    title: 'ACCOUNT',
    items: [
      { to: '/profile',      icon: User,             label: 'Profile' },
      { to: '/settings',     icon: Settings,         label: 'Settings' },
    ]
  }
];

const adminNavItems = [
  {
    title: 'MAIN MENU',
    items: [
      { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/post-job',        icon: PlusCircle,      label: 'Post a Job' },
      { to: '/admin/jobs',      icon: Briefcase,       label: 'Manage Jobs' },
      { to: '/admin/resources', icon: BookOpen,        label: 'Manage Resources' },
      { to: '/admin/users',     icon: User,            label: 'Manage Users' },
    ]
  },
  {
    title: 'ACCOUNT',
    items: [
      { to: '/profile',         icon: User,            label: 'Profile' },
    ]
  }
];

// Mobile bottom nav items (subset, most important)
const mobileUserNav = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Home' },
  { to: '/applications', icon: FileText,         label: 'Applications' },
  { to: '/saved-jobs',   icon: Bookmark,         label: 'Saved' },
  { to: '/profile',      icon: User,             label: 'Profile' },
  { to: '/settings',     icon: Settings,         label: 'Settings' },
];

const mobileAdminNav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/post-job',        icon: PlusCircle,      label: 'Post Job' },
  { to: '/admin/jobs',      icon: Briefcase,       label: 'Jobs' },
  { to: '/profile',         icon: User,            label: 'Profile' },
];

const Sidebar = ({ mobileOpen = false, onClose }) => {
  const user = useSelector(selectUser);
  const { logout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin ? adminNavItems : userNavItems;
  const mobileNavItems = isAdmin ? mobileAdminNav : mobileUserNav;

  const SidebarContent = () => (
    <>
      {/* User Info */}
      <Link to="/profile" onClick={onClose} className="flex items-center gap-3 px-3 mb-8 group">
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {user?.avatar ? (
            <img src={getAvatarUrl(user.avatar)} alt={user?.fullName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-primary-700">{getInitials(user?.fullName)}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName || 'User'}</p>
          {isAdmin ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600">
              <Shield size={10} /> Administrator
            </span>
          ) : (
            <p className="text-xs text-gray-500 truncate">{user?.headline || 'View Profile'}</p>
          )}
        </div>
      </Link>

      {/* Nav Items */}
      <nav className="flex-1 space-y-6">
        {navItems.map((section, idx) => (
          <div key={idx}>
            {section.title && (
              <h3 className="px-3 mb-2 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                {section.title}
              </h3>
            )}
            <div className="space-y-0.5">
              {section.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </NavLink>
              ))}
              {/* Logout under Account */}
              {section.title === 'ACCOUNT' && (
                <button onClick={() => { onClose?.(); logout(); }} className="nav-item text-gray-600 hover:bg-gray-50 hover:text-red-600 w-full justify-start transition-colors">
                  <LogOut size={16} className="text-gray-400 group-hover:text-red-500" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* Profile completion */}
      {!isAdmin && user?.profileCompletion < 100 && location.pathname !== '/profile' && (
        <div className="mx-1 mb-4 p-3 bg-primary-50 rounded-xl border border-primary-100">
          <p className="text-xs font-semibold text-primary-800 mb-1">Complete your profile</p>
          <p className="text-xs text-primary-600 mb-2">Get noticed by top recruiters.</p>
          <div className="w-full bg-primary-200 rounded-full h-1.5 mb-2">
            <div className="bg-primary-600 h-1.5 rounded-full transition-all" style={{ width: `${user?.profileCompletion}%` }} />
          </div>
          <p className="text-xs text-primary-700 font-medium">{user?.profileCompletion}% Completed</p>
          <Link to="/profile" onClick={onClose} className="mt-2 w-full btn-primary btn-sm flex justify-center">Improve Profile</Link>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-64 min-h-screen bg-white border-r border-gray-100 flex-col py-6 px-4">
        <SidebarContent />
      </aside>

      {/* ── Mobile Drawer Overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 h-full w-64 max-w-[80vw] bg-white border-r border-gray-100 flex flex-col py-6 px-4 shadow-2xl animate-slide-in-left">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Menu</span>
              <button onClick={onClose} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-inset-bottom">
        <div className="flex items-center justify-around px-1 py-1">
          {mobileNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[56px] transition-colors ${
                  isActive ? 'text-primary-600' : 'text-gray-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-lg ${isActive ? 'bg-primary-50' : ''}`}>
                    <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                  </div>
                  <span className="text-[10px] font-medium leading-none">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
