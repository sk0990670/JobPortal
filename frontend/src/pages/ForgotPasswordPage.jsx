import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BriefcaseBusiness, Mail, ArrowLeft, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import heroIllustration from '../assets/hero-illustration.png';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef([]);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleRequestOTP = async (data) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data);
      setEmail(data.email);
      setStep(2);
      toast.success('Password reset OTP sent to your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleResendOTP = async () => {
    setResending(true);
    try {
      await authService.forgotPassword({ email });
      toast.success('New OTP sent to your email.');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (e.key === 'Enter') {
      handleSubmit(handleResetPassword)();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputs.current[5]?.focus();
    }
  };

  const handleResetPassword = async (data) => {
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter the full 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword({ email, otp: code, password: data.newPassword });
      toast.success('Password has been reset successfully! You can now log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
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
            Get back to your<br />
            <span className="text-gradient">career journey</span>
          </h2>
          <p className="text-gray-600">Regain access to your account and explore new opportunities.</p>
        </div>

        {/* Image */}
        <div className="flex-1 flex items-center justify-center min-h-0 mb-6">
          <img
            src={heroIllustration}
            alt="Career illustration"
            className="w-full max-w-md object-contain"
            style={{ maxHeight: '420px' }}
          />
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

          {step === 1 ? (
            <div className="card-p">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
                <p className="text-gray-500 text-sm mt-2">
                  No worries! Enter your email and we'll send you an OTP to reset it.
                </p>
              </div>

              <form onSubmit={handleSubmit(handleRequestOTP)} className="space-y-5">
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 mt-px text-gray-400" />
                    <input
                      {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                      type="email"
                      placeholder="Enter your email address"
                      className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
                  {loading ? 'Sending OTP…' : 'Send Reset OTP'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-primary-600 flex items-center justify-center gap-2 transition-colors">
                  <ArrowLeft size={16} /> Back to Log In
                </Link>
              </div>
            </div>
          ) : (
            <div className="card-p">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Set new password</h1>
                <p className="text-gray-500 text-sm mt-2">
                  We sent a 6-digit OTP to <span className="font-semibold text-primary-600">{email}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-6">
                <div>
                  <div className="flex gap-2 sm:gap-3 justify-center mb-4" onPaste={handlePaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => inputs.current[i] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOTPChange(i, e.target.value)}
                        onKeyDown={e => handleKeyDown(i, e)}
                        className={`w-9 sm:w-11 h-11 sm:h-12 text-center text-xl sm:text-2xl font-bold border-2 rounded-xl outline-none transition-all
                          ${digit ? 'border-primary-500 bg-indigo-50 text-primary-700' : 'border-gray-200 text-gray-900'}
                          focus:border-primary-500 focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50 shadow-sm`}
                      />
                    ))}
                  </div>
                  
                  <div className="text-center text-sm pt-1 pb-2">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resending}
                      className="text-primary-600 font-semibold hover:underline disabled:text-gray-400 disabled:no-underline transition-colors"
                    >
                      {resending ? 'Resending...' : "Didn't receive the code? Resend OTP"}
                    </button>
                  </div>
                </div>

                <div className="mt-2">
                  <label className="label">New Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 mt-px text-gray-400" />
                    <input
                      {...register('newPassword', { required: 'New password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                      type="password"
                      placeholder="Enter new password"
                      className={`input pl-10 ${errors.newPassword ? 'input-error' : ''}`}
                    />
                  </div>
                  {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
                  {loading ? 'Resetting…' : 'Reset Password'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-primary-600 flex items-center justify-center gap-2 transition-colors">
                  <ArrowLeft size={16} /> Back to Log In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
