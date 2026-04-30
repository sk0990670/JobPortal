import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mail, Phone, MapPin, User, ShieldAlert, MoreVertical, Search, Eye, Edit3, Ban, Trash2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { getAvatarUrl, getInitials } from '../../utils/formatters';

const AdminUsers = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminService.getUsers,
  });

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [openMenuId, setOpenMenuId] = useState(null);

  const users = data?.data || [];

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    
    if (filter === 'active') return u.status === 'active';
    if (filter === 'suspended') return u.status === 'suspended';
    if (filter === 'incomplete') return !u.headline || !u.location;
    return true;
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            View registered users and their details. Privacy settings apply.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search by name or email..." 
              className="input pl-9 w-full"
            />
          </div>
          <select 
            value={filter} 
            onChange={e => setFilter(e.target.value)} 
            className="input w-full sm:w-40 appearance-none cursor-pointer"
          >
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="incomplete">Incomplete Profile</option>
          </select>
          <div className="text-sm font-medium bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm whitespace-nowrap">
            Total: <span className="text-primary-600">{filteredUsers.length}</span>
          </div>
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
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-100">
          <User className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No users found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <div key={user._id} className="card-p flex flex-col h-full transition-shadow hover:shadow-md relative">
              
              {/* Kebab Menu */}
              <div className="absolute top-4 right-4">
                <button onClick={() => setOpenMenuId(openMenuId === user._id ? null : user._id)} className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical size={18} />
                </button>
                {openMenuId === user._id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20">
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Eye size={14} className="text-gray-400" /> View Full Profile
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Edit3 size={14} className="text-gray-400" /> Edit Details
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2">
                        <Ban size={14} className="text-orange-500" /> Suspend User
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50 mt-1 pt-2">
                        <Trash2 size={14} className="text-red-500" /> Delete Account
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div>
                <div className="flex items-start gap-4 mb-4 pr-6">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {user.avatar ? (
                      <img src={getAvatarUrl(user.avatar)} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-primary-700">{getInitials(user.fullName)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{user.fullName}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 pr-2">{user.headline || 'No headline provided'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <div className="space-y-3 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className={`w-4 h-4 ${user.email === 'Hidden by user' ? 'text-gray-300' : 'text-gray-400'}`} />
                    <span className={`truncate ${user.email === 'Hidden by user' ? 'text-gray-400 italic' : 'text-gray-700'}`}>
                      {user.email}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className={`w-4 h-4 ${user.phone === 'Hidden by user' ? 'text-gray-300' : 'text-gray-400'}`} />
                    <span className={`truncate ${user.phone === 'Hidden by user' ? 'text-gray-400 italic' : 'text-gray-700'}`}>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
