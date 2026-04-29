import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import { BriefcaseBusiness, Mail, RefreshCw, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const OTPVerifyPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();

  const email     = location.state?.email || '';
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
      const { data } = await authService.verifyOTP({ email, otp: code });
      dispatch(setCredentials({ user: data.user, token: data.token }));
      localStorage.setItem('token', data.token);
      toast.success('Email verified! Welcome to JobPortal 🎉');
      navigate('/dashboard');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50 px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 font-bold text-xl text-gray-900 mb-8">
          <BriefcaseBusiness size={30} className="text-primary-600" strokeWidth={1.8} />
          Job<span className="text-primary-600">Portal</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
            <p className="text-gray-500 text-sm mt-2">
              We sent a 6-digit OTP to
            </p>
            <p className="text-primary-600 font-semibold text-sm mt-1">{email}</p>
          </div>

          {/* OTP Inputs */}
          <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
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
                className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all
                  ${digit ? 'border-primary-500 bg-indigo-50 text-primary-700' : 'border-gray-200 text-gray-900'}
                  focus:border-primary-500 focus:ring-2 focus:ring-primary-100`}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || otp.join('').length !== 6}
            className="btn-primary w-full justify-center py-3 text-base mb-4"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle size={18} />
                Verify OTP
              </span>
            )}
          </button>

          {/* Resend */}
          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-gray-500">
                Resend OTP in <span className="font-semibold text-primary-600">{countdown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1 mx-auto"
              >
                <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
                {resending ? 'Sending…' : 'Resend OTP'}
              </button>
            )}
          </div>

        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Wrong email?{' '}
          <Link to="/signup" className="text-primary-600 font-medium hover:underline">Go back</Link>
        </p>
      </div>
    </div>
  );
};

export default OTPVerifyPage;
