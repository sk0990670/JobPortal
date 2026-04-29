import { formatDistanceToNow, format } from 'date-fns';

export const formatSalary = (salary) => {
  if (!salary?.min) return 'Not disclosed';
  const fmt = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(0)}L` : `₹${(n / 1000).toFixed(0)}K`;
  if (salary.max && salary.max !== salary.min) {
    return `${fmt(salary.min)} - ${fmt(salary.max)}/${salary.period || 'month'}`;
  }
  return `${fmt(salary.min)}/${salary.period || 'month'}`;
};

export const formatDate = (date) => {
  if (!date) return '';
  return format(new Date(date), 'dd MMM yyyy');
};

export const formatRelativeDate = (date) => {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '';
  }
};

export const getInitials = (name = '') => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

export const truncate = (str, n = 100) => {
  if (!str) return '';
  return str.length > n ? str.substring(0, n) + '...' : str;
};

export const formatLocation = (location) => {
  if (!location) return '';
  if (typeof location === 'string') return location;
  const parts = [location.city, location.state].filter(Boolean);
  return parts.join(', ');
};

export const getStatusColor = (status) => {
  const map = {
    Applied: 'status-applied',
    Shortlisted: 'status-shortlisted',
    Interview: 'status-interview',
    Offered: 'status-offered',
    Rejected: 'status-rejected',
    Withdrawn: 'status-withdrawn',
  };
  return map[status] || 'badge-gray';
};

export const buildQueryString = (params) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && value.length === 0)) {
      if (Array.isArray(value)) query.set(key, value.join(','));
      else query.set(key, String(value));
    }
  });
  return query.toString();
};

export const getAvatarUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${import.meta.env.VITE_API_URL?.replace('/api', '')}${url}`;
};
