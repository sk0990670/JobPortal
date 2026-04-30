import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Heart, Bell, ChevronDown, BriefcaseBusiness, LogOut, User,
  Settings, LayoutDashboard, PlusCircle, Menu, X, Briefcase, BookOpen
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { selectIsAuthenticated, selectUser } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import { getInitials, getAvatarUrl } from '../../utils/formatters';
import { io } from 'socket.io-client';
import api from '../../services/api';

const navLinks = [
  { to: '/jobs', label: 'Find Jobs' },
  { to: '/internships', label: 'Internships' },
  { to: '/companies', label: 'Companies' },
  { to: '/resources', label: 'Resources' },
  { to: '/about', label: 'About' },
];

const Navbar = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const notifRef = useRef(null);
  const [notifications, setNotifications] = useState([]);

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    setNotifDropdownOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      api.get('/notifications').then(res => setNotifications(res.data.data)).catch(() => {});

      const socket = io(import.meta.env.VITE_API_URL.replace('/api', ''), {
        withCredentials: true,
      });

      socket.on('connect', () => socket.emit('join', user._id));
      socket.on('new_notification', (newNotif) => setNotifications(prev => [newNotif, ...prev]));

      return () => socket.disconnect();
    }
  }, [isAuthenticated, user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) { console.error('Error marking as read'); }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) { console.error('Error marking all as read'); }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="page-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 font-bold text-xl text-gray-900 flex-shrink-0">
              <BriefcaseBusiness size={32} className="text-primary-600" strokeWidth={1.8} />
              <span>Job<span className="text-primary-600">Portal</span></span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'text-primary-600 border-b-2 border-primary-600 rounded-none' : 'text-gray-600 hover:text-gray-900'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1 sm:gap-2">
              {isAuthenticated ? (
                <>
                  {/* Admin: Post Job button — desktop only */}
                  {user?.role === 'admin' && (
                    <Link
                      to="/post-job"
                      className="hidden md:flex items-center gap-1.5 btn-primary text-sm px-4 py-2"
                    >
                      <PlusCircle size={15} /> Post a Job
                    </Link>
                  )}

                  {/* Saved Jobs heart */}
                  <button
                    onClick={() => navigate('/saved-jobs')}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Saved jobs"
                  >
                    <Heart size={18} />
                  </button>

                  {/* Notifications */}
                  <div
                    className="relative"
                    ref={notifRef}
                    onMouseEnter={() => setNotifDropdownOpen(true)}
                    onMouseLeave={() => setNotifDropdownOpen(false)}
                  >
                    <button
                      onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                      className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Notifications"
                    >
                      <Bell size={18} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                      )}
                    </button>

                    {notifDropdownOpen && (
                      <div className="absolute right-0 top-full pt-2 w-80 max-w-[calc(100vw-1rem)] z-50 animate-fade-in">
                        <div className="bg-white border border-gray-100 rounded-xl shadow-dropdown overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                              <button onClick={markAllAsRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                                Mark all as read
                              </button>
                            )}
                          </div>
                          <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
                            ) : (
                              notifications.map((notif) => (
                                <div
                                  key={notif._id}
                                  onClick={() => { markAsRead(notif._id); setNotifDropdownOpen(false); }}
                                  className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${notif.isRead ? 'bg-white hover:bg-gray-50' : 'bg-primary-50/50 hover:bg-primary-50'}`}
                                >
                                  <div className="flex gap-3 items-start">
                                    <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${notif.isRead ? 'bg-transparent' : 'bg-primary-600'}`} />
                                    <div>
                                      <p className={`text-sm ${notif.isRead ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                                        {notif.message}
                                      </p>
                                      <p className="text-xs text-gray-400 mt-1">
                                        {new Date(notif.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User avatar dropdown — desktop */}
                  <div
                    className="relative hidden md:block"
                    ref={dropdownRef}
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                        {user?.avatar ? (
                          <img src={getAvatarUrl(user.avatar)} alt={user.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-semibold text-primary-700">{getInitials(user?.fullName)}</span>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900 leading-tight">{user?.fullName}</p>
                        <p className="text-xs text-gray-500">View Profile</p>
                      </div>
                      <ChevronDown size={14} className="text-gray-400" />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 top-full pt-2 w-48 z-50 animate-fade-in">
                        <div className="card py-1 shadow-dropdown bg-white rounded-xl border border-gray-100">
                          {user?.role === 'admin' ? (
                            <>
                              <Link to="/admin/dashboard" onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                <LayoutDashboard size={15} /> Dashboard
                              </Link>
                              <Link to="/post-job" onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-primary-600 font-medium hover:bg-primary-50 transition-colors">
                                <PlusCircle size={15} /> Post a Job
                              </Link>
                              <Link to="/admin/jobs" onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                <Briefcase size={15} /> Manage Jobs
                              </Link>
                              <Link to="/admin/resources" onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                <BookOpen size={15} /> Manage Resources
                              </Link>
                              <Link to="/admin/users" onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                <User size={15} /> Manage Users
                              </Link>
                              <Link to="/profile" onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                <User size={15} /> My Profile
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link to="/dashboard" onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                <LayoutDashboard size={15} /> Dashboard
                              </Link>
                              <Link to="/profile" onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                <User size={15} /> My Profile
                              </Link>
                              <Link to="/settings" onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                <Settings size={15} /> Settings
                              </Link>
                            </>
                          )}
                          <hr className="my-1 border-gray-100" />
                          <button onClick={() => { setDropdownOpen(false); logout(); }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                            <LogOut size={15} /> Log Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile avatar (small) */}
                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="md:hidden w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden"
                    aria-label="Open menu"
                  >
                    {user?.avatar ? (
                      <img src={getAvatarUrl(user.avatar)} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-semibold text-primary-700">{getInitials(user?.fullName)}</span>
                    )}
                  </button>
                </>
              ) : (
                <>
                  {/* Desktop auth buttons */}
                  <Link to="/login" className="hidden sm:block btn-ghost text-sm font-medium px-4 py-2 rounded-lg">Log in</Link>
                  <Link to="/signup" className="hidden sm:block btn-primary">Sign Up</Link>
                  {/* Mobile: single login button */}
                  <Link to="/login" className="sm:hidden btn-primary btn-sm">Log in</Link>
                </>
              )}

              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-1"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu Overlay ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100 flex-shrink-0">
              <Link to="/" className="flex items-center gap-1.5 font-bold text-lg text-gray-900">
                <BriefcaseBusiness size={24} className="text-primary-600" strokeWidth={1.8} />
                <span>Job<span className="text-primary-600">Portal</span></span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* User info (authenticated) */}
            {isAuthenticated && (
              <Link to="/profile" className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {user?.avatar ? (
                    <img src={getAvatarUrl(user.avatar)} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-primary-700">{getInitials(user?.fullName)}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </Link>
            )}

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto py-3">
              <p className="px-5 py-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase">Explore</p>
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 mx-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}

              {isAuthenticated && (
                <>
                  <hr className="mx-5 my-3 border-gray-100" />
                  <p className="px-5 py-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase">Account</p>

                  {user?.role === 'admin' ? (
                    <>
                      <Link to="/admin/dashboard"
                        className="flex items-center gap-3 mx-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                      <Link to="/post-job"
                        className="flex items-center gap-3 mx-3 px-4 py-3 rounded-xl text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors">
                        <PlusCircle size={16} /> Post a Job
                      </Link>
                      <Link to="/admin/jobs"
                        className="flex items-center gap-3 mx-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <Briefcase size={16} /> Manage Jobs
                      </Link>
                      <Link to="/admin/resources"
                        className="flex items-center gap-3 mx-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <BookOpen size={16} /> Manage Resources
                      </Link>
                      <Link to="/admin/users"
                        className="flex items-center gap-3 mx-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <User size={16} /> Manage Users
                      </Link>
                      <Link to="/profile"
                        className="flex items-center gap-3 mx-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <User size={16} /> My Profile
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/dashboard"
                        className="flex items-center gap-3 mx-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                      <Link to="/profile"
                        className="flex items-center gap-3 mx-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <User size={16} /> My Profile
                      </Link>
                      <Link to="/settings"
                        className="flex items-center gap-3 mx-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <Settings size={16} /> Settings
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Footer actions */}
            <div className="px-4 py-4 border-t border-gray-100 flex-shrink-0 space-y-2">
              {isAuthenticated ? (
                <button onClick={() => { setMobileMenuOpen(false); logout(); }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-colors">
                  <LogOut size={16} /> Log Out
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" className="flex-1 btn-secondary justify-center text-sm">Log in</Link>
                  <Link to="/signup" className="flex-1 btn-primary justify-center text-sm">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
