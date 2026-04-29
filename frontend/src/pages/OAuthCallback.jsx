import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

/**
 * /auth/callback
 * Google redirects here after OAuth with ?token=<JWT>
 * We save it to Redux + localStorage then navigate to dashboard.
 */
const OAuthCallback = () => {
  const [params] = useSearchParams();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      toast.error('Google sign-in failed. Please try again.');
      navigate('/login');
      return;
    }

    if (!token) {
      toast.error('No token received.');
      navigate('/login');
      return;
    }

    // Store token
    localStorage.setItem('token', token);

    // Fetch the user profile using the token
    authService.getMe()
      .then(({ data }) => {
        dispatch(setCredentials({ user: data.data, token }));
        toast.success(`Welcome, ${data.data.fullName}! 🎉`);
        navigate('/dashboard');
      })
      .catch(() => {
        toast.error('Failed to load your profile. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Signing you in with Google…</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
