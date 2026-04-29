import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Bookmark, User, Settings,
  LogOut, Building2, Briefcase, BookOpen, PlusCircle, Shield
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
    ]
  },
  {
    title: 'ACCOUNT',
    items: [
      { to: '/profile',         icon: User,            label: 'Profile' },
    ]
  }
];

const Sidebar = () => {
  const user = useSelector(selectUser);
  const { logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col py-6 px-4">
      {/* User Info */}
      <Link to="/profile" className="flex items-center gap-3 px-3 mb-8 group">
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
                  className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </NavLink>
              ))}
              {/* Special case: Add Logout under Account */}
              {section.title === 'ACCOUNT' && (
                <button onClick={logout} className="nav-item text-gray-600 hover:bg-gray-50 hover:text-red-600 w-full justify-start transition-colors">
                  <LogOut size={16} className="text-gray-400 group-hover:text-red-500" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* Profile completion (only for non-admin) */}
      {!isAdmin && user?.profileCompletion < 100 && (
        <div className="mx-1 mb-4 p-3 bg-primary-50 rounded-xl border border-primary-100">
          <p className="text-xs font-semibold text-primary-800 mb-1">Complete your profile</p>
          <p className="text-xs text-primary-600 mb-2">Get noticed by top recruiters.</p>
          <div className="w-full bg-primary-200 rounded-full h-1.5 mb-2">
            <div className="bg-primary-600 h-1.5 rounded-full transition-all" style={{ width: `${user?.profileCompletion}%` }} />
          </div>
          <p className="text-xs text-primary-700 font-medium">{user?.profileCompletion}% Completed</p>
          <Link to="/profile" className="mt-2 w-full btn-primary btn-sm flex justify-center">Improve Profile</Link>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
