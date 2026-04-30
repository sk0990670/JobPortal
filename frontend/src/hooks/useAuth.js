import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectAuth, setCredentials, logout as logoutAction, updateUser } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const auth = useSelector(selectAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const login = async (credentials) => {
    const { data } = await authService.login(credentials);
    
    if (data.requires2FA) {
      toast.success(data.message || 'OTP sent to your email.');
      navigate(`/verify-otp?email=${encodeURIComponent(data.email)}&type=2fa`);
      return data;
    }
    
    dispatch(setCredentials({ user: data.user, token: data.token }));
    toast.success(data.message || 'Logged in successfully!');
    navigate('/dashboard');
    return data;
  };

  const register = async (userData) => {
    const { data } = await authService.register(userData);
    dispatch(setCredentials({ user: data.user, token: data.token }));
    toast.success(data.message || 'Account created!');
    navigate('/dashboard');
    return data;
  };

  const logout = async () => {
    try { await authService.logout(); } catch {}
    dispatch(logoutAction());
    toast.success('Logged out successfully.');
    navigate('/');
  };

  const refreshUser = async () => {
    try {
      const { data } = await authService.getMe();
      dispatch(updateUser(data.data));
    } catch {}
  };

  return {
    ...auth,
    login,
    register,
    logout,
    refreshUser,
  };
};
