import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Edit3, Trash2, Search, AlertTriangle, BookOpen, Clock, Tag } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { formatRelativeDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const CATEGORIES = ['Career Guidance', 'Interview Tips', 'Resume Writing', 'Salary Guide', 'Industry Insights', 'Skill Development'];

const AdminResources = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // holds resource being edited
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', category: 'Career Guidance', readTime: 5, isFeatured: false, isPublished: true });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-resources', search],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/resources?search=${search}&limit=50`);
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(editing ? 'Resource updated!' : 'Resource published! Subscribers notified. ✉️');
        queryClient.invalidateQueries(['admin-resources']);
        setShowForm(false); setEditing(null);
        setForm({ title: '', excerpt: '', content: '', category: 'Career Guidance', readTime: 5, isFeatured: false, isPublished: true });
      } else { toast.error(data.message || 'Failed'); }
    },
    onError: () => toast.error('Server error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/resources/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success('Resource deleted');
      queryClient.invalidateQueries(['admin-resources']);
      setDeleteId(null);
    },
  });

  const openEdit = (r) => {
    setEditing(r);
    setForm({ title: r.title, excerpt: r.excerpt, content: r.content || '', category: r.category, readTime: r.readTime || 5, isFeatured: r.isFeatured, isPublished: r.isPublished });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.excerpt) return toast.error('Title and excerpt are required');
    createMutation.mutate(form);
  };

  const resources = (data?.data || []).filter(r => r.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Resources</h1>
          <p className="text-sm text-gray-500">{resources.length} resources published</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary gap-2">
          <PlusCircle size={16} /> Add Resource
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources…" className="input pl-9 w-full max-w-sm" />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Read Time</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Published</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <tr key={i}>{Array(6).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>)}</tr>
              ))
            ) : resources.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  No resources yet. <button onClick={() => setShowForm(true)} className="text-primary-600 font-medium">Add one →</button>
                </td>
              </tr>
            ) : resources.map(r => (
              <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-primary-400 flex-shrink-0" />
                    <p className="font-medium text-gray-900 truncate max-w-[200px]">{r.title}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px] pl-5">{r.excerpt}</p>
                </td>
                <td className="px-4 py-3"><span className="badge-purple text-xs flex items-center gap-1 w-fit"><Tag size={10} />{r.category}</span></td>
                <td className="px-4 py-3 text-gray-500"><span className="flex items-center gap-1"><Clock size={11} />{r.readTime} min</span></td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {r.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{formatRelativeDate(r.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Edit3 size={15} /></button>
                    <button onClick={() => setDeleteId(r._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">{editing ? 'Edit Resource' : 'Add New Resource'}</h3>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-gray-400 hover:text-gray-600 text-xl font-light">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Top 10 Interview Tips" className="input" required />
              </div>
              <div>
                <label className="label">Short Excerpt *</label>
                <input value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="One-line summary shown in cards" className="input" required />
              </div>
              <div>
                <label className="label">Full Content</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={6} placeholder="Write the full article content here…" className="input resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Read Time (minutes)</label>
                  <input type="number" min={1} max={60} value={form.readTime} onChange={e => setForm(f => ({ ...f, readTime: Number(e.target.value) }))} className="input" />
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="w-4 h-4 rounded text-primary-600" />
                  Featured
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="w-4 h-4 rounded text-primary-600" />
                  Publish immediately (notifies subscribers)
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={createMutation.isLoading} className="btn-primary flex-1">
                  {createMutation.isLoading ? 'Saving…' : editing ? 'Save Changes' : 'Publish Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-center mb-1">Delete this resource?</h3>
            <p className="text-sm text-gray-500 text-center mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isLoading}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-sm transition-colors">
                {deleteMutation.isLoading ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResources;
