import { useQuery } from '@tanstack/react-query';
import { Mail, Phone, MapPin, User, ShieldAlert } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { getAvatarUrl, getInitials } from '../../utils/formatters';

const AdminUsers = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminService.getUsers,
  });

  const users = data?.data || [];

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            View registered users and their details. Privacy settings apply.
          </p>
        </div>
        <div className="text-sm font-medium bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
          Total Users: <span className="text-primary-600">{users.length}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card-p animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl">
          Failed to load users. Please try again.
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-100">
          <User className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No users found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(user => (
            <div key={user._id} className="card-p flex flex-col transition-shadow hover:shadow-md">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {user.avatar ? (
                    <img src={getAvatarUrl(user.avatar)} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-primary-700">{getInitials(user.fullName)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{user.fullName}</h3>
                  <p className="text-sm text-gray-500 truncate">{user.headline || 'No headline provided'}</p>
                </div>
              </div>

              <div className="mt-auto space-y-3 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className={`w-4 h-4 ${user.email === 'Hidden by user' ? 'text-orange-400' : 'text-gray-400'}`} />
                  <span className={`truncate ${user.email === 'Hidden by user' ? 'text-orange-600 italic font-medium' : 'text-gray-700'}`}>
                    {user.email}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <Phone className={`w-4 h-4 ${user.phone === 'Hidden by user' ? 'text-orange-400' : 'text-gray-400'}`} />
                  <span className={`truncate ${user.phone === 'Hidden by user' ? 'text-orange-600 italic font-medium' : 'text-gray-700'}`}>
                    {user.phone || 'Not provided'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="truncate text-gray-700">{user.location || 'Location not specified'}</span>
                </div>
              </div>
              
              {(!user.settings?.showEmail || !user.settings?.showPhone) && (
                <div className="mt-4 px-3 py-2 bg-orange-50 rounded-lg flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <p className="text-xs text-orange-700">Some details hidden by user privacy settings</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
