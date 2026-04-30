import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import { BriefcaseBusiness, Mail, RefreshCw, CheckCircle, Shield, Target, Bookmark, TrendingUp, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import loginIllustration from '../assets/login-illustration.png';

const FEATURES = [
  { icon: Target,     color: 'bg-indigo-100 text-indigo-600', title: 'Discover Opportunities',  desc: 'Find internships and entry-level jobs from top companies.' },
  { icon: Bookmark,   color: 'bg-purple-100 text-purple-600',  title: 'Save & Track',            desc: 'Save jobs and track your applications in one place.' },
  { icon: TrendingUp, color: 'bg-blue-100 text-blue-600',      title: 'Grow Your Career',        desc: 'Build skills, get noticed and advance your career.' },
];

const OTPVerifyPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();

  const searchParams = new URLSearchParams(location.search);
  const is2FA = searchParams.get('type') === '2fa';

  const email     = location.state?.email || searchParams.get('email') || '';
  const [otp, setOtp]         = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  // Redirect if no email passed
  useEffect(() => {
    if (!email) navigate('/signup');
  }, [email]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Enter all 6 digits.'); return; }

    setLoading(true);
    try {
      if (is2FA) {
        const { data } = await authService.verify2FALogin({ email, token: code });
        dispatch(setCredentials({ user: data.user, token: data.token }));
        toast.success(data.message || 'Login successful! 🎉');
        navigate('/dashboard');
      } else {
        const { data } = await authService.verifyOTP({ email, otp: code });
        dispatch(setCredentials({ user: data.user, token: data.token }));
        toast.success(data.message || 'Email verified! Welcome to JobPortal 🎉');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendOTP({ email });
      toast.success('New OTP sent to your email!');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
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
            Secure your account on<br />
            <span className="text-gradient">JobPortal</span>
          </h2>
          <p className="text-gray-600">Verify your identity to keep your dream career safe.</p>
        </div>

        {/* Image */}
        <div className="flex-1 flex items-center justify-center min-h-0 mb-6">
          <img
            src={loginIllustration}
            alt="Job search illustration"
            className="w-full max-w-md object-contain"
            style={{ maxHeight: '340px' }}
          />
        </div>

        {/* Feature bullets */}
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
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {is2FA ? <Shield size={28} className="text-primary-600" /> : <Mail size={28} className="text-primary-600" />}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {is2FA ? 'Two-Factor Authentication' : 'Verify Your Email'}
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              {is2FA ? 'Enter the 6-digit code from your Authenticator app for' : 'We sent a 6-digit OTP to'}
            </p>
            <p className="text-primary-600 font-semibold text-sm mt-1">{email}</p>
          </div>

          <div className="card-p">
            <div className="space-y-6">
              {/* OTP Inputs */}
              <div className="flex gap-2 sm:gap-3 justify-center mb-2" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => inputs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className={`w-10 sm:w-12 h-12 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 rounded-xl outline-none transition-all
                      ${digit ? 'border-primary-500 bg-indigo-50 text-primary-700' : 'border-gray-200 text-gray-900'}
                      focus:border-primary-500 focus:ring-2 focus:ring-primary-100`}
                  />
                ))}
              </div>

              <button 
                onClick={handleVerify}
                disabled={loading} 
                className="btn-primary w-full justify-center py-3 text-base flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Verifying…
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Verify {is2FA ? 'Code' : 'OTP'}
                  </>
                )}
              </button>

              {/* Resend OTP */}
              {!is2FA && (
                <div className="text-center text-sm pt-2">
                  <p className="text-gray-500 mb-2">Didn't receive the email?</p>
                  <button
                    onClick={handleResend}
                    disabled={countdown > 0 || resending}
                    className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 disabled:text-gray-400 transition-colors"
                  >
                    <RefreshCw size={16} className={resending ? 'animate-spin' : ''} />
                    {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-primary-600 flex items-center justify-center gap-2 transition-colors">
              <ArrowLeft size={16} /> Back to Log In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OTPVerifyPage;
