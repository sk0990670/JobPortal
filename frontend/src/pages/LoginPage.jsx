import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, BriefcaseBusiness, Target, Bookmark, TrendingUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import loginIllustration from '../assets/login-illustration.png';

const FEATURES = [
  { icon: Target,     color: 'bg-indigo-100 text-indigo-600', title: 'Discover Opportunities',  desc: 'Find internships and entry-level jobs from top companies.' },
  { icon: Bookmark,   color: 'bg-purple-100 text-purple-600',  title: 'Save & Track',            desc: 'Save jobs and track your applications in one place.' },
  { icon: TrendingUp, color: 'bg-blue-100 text-blue-600',      title: 'Grow Your Career',        desc: 'Build skills, get noticed and advance your career.' },
];

const LoginPage = () => {
  const { login } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try { await login(data); }
    catch (err) { toast.error(err.response?.data?.message || 'Login failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex flex-col bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50 px-12 py-10 overflow-hidden">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 mb-8 flex-shrink-0">
          <BriefcaseBusiness size={30} className="text-primary-600" strokeWidth={1.8} />
          Job<span className="text-primary-600">Portal</span>
        </Link>

        {/* Headline */}
        <div className="mb-6 flex-shrink-0">
          <h2 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">
            Welcome back to<br />
            <span className="text-gradient">JobPortal</span>
          </h2>
          <p className="text-gray-500 text-sm">Find your dream career with thousands of opportunities.</p>
        </div>

        {/* Illustration — fills the middle, no overlap */}
        <div className="flex-1 flex items-center justify-center min-h-0 mb-6">
          <img
            src={loginIllustration}
            alt="Job search illustration"
            className="w-full max-w-md object-contain"
            style={{ maxHeight: '340px' }}
          />
        </div>

        {/* Feature bullets — always below the image */}
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
      <div className="flex items-center justify-center px-6 py-14 bg-white">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link to="/" className="flex items-center justify-center gap-2 font-bold text-xl text-gray-900 mb-6 lg:hidden">
            <BriefcaseBusiness size={28} className="text-primary-600" strokeWidth={1.8} />
            Job<span className="text-primary-600">Portal</span>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Log In</h1>
            <p className="text-gray-500 mt-1 text-sm">Welcome back! Please enter your details.</p>
          </div>

          <div className="card-p">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Email */}
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } })}
                    type="email"
                    placeholder="Enter your email address"
                    className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('password', { required: 'Password is required' })}
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              {/* Remember me / Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-400" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative text-center"><span className="bg-white px-3 text-sm text-gray-400">OR</span></div>
            </div>

            {/* Social */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href="http://localhost:5000/api/auth/google"
                className="btn-secondary text-sm gap-2 justify-center flex items-center"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                Google
              </a>
              <button className="btn-secondary text-sm gap-2 justify-center opacity-50 cursor-not-allowed" disabled title="Coming soon">
                <img src="https://www.linkedin.com/favicon.ico" alt="LinkedIn" className="w-4 h-4" />
                LinkedIn
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-5">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-600 font-medium hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
