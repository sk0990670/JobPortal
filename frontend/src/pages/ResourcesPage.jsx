import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Search, Clock, Bookmark, ChevronRight, Mail, Target, FileText, MessageSquare, Code2, Building, Star, X, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

const CATEGORIES = [
  { id: 'all', label: 'All Resources' },
  { id: 'career', label: 'Career Guidance' },
  { id: 'resume', label: 'Resume Writing' },
  { id: 'interview', label: 'Interview Tips' },
  { id: 'skills', label: 'Skill Development' },
  { id: 'industry', label: 'Industry Insights' },
  { id: 'salary', label: 'Salary Guide' },
];

const POPULAR_TOPICS = [
  { id: 'career', label: 'Career Guidance', count: 12, icon: Target, color: 'bg-indigo-100 text-indigo-600' },
  { id: 'resume', label: 'Resume Writing', count: 15, icon: FileText, color: 'bg-green-100 text-green-600' },
  { id: 'interview', label: 'Interview Tips', count: 18, icon: MessageSquare, color: 'bg-orange-100 text-orange-600' },
  { id: 'skills', label: 'Skill Development', count: 20, icon: Code2, color: 'bg-blue-100 text-blue-600' },
  { id: 'industry', label: 'Industry Insights', count: 14, icon: Building, color: 'bg-purple-100 text-purple-600' },
];

const getResourceStyle = (category) => {
  const map = {
    'Career Guidance': {
      categoryColor: 'bg-blue-100 text-blue-600',
      bg: 'from-blue-50 to-indigo-100',
      illustration: (
        <svg viewBox="0 0 120 100" className="w-28 h-24 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="60" width="100" height="4" rx="2" fill="#c7d2fe" />
          <polygon points="60,15 20,62 100,62" fill="#6366f1" opacity="0.7" />
          <circle cx="60" cy="14" r="5" fill="#4f46e5" />
          <rect x="55" y="5" width="10" height="14" rx="2" fill="#818cf8" />
          <rect x="57" y="2" width="6" height="5" rx="1" fill="#6366f1" />
          <rect x="59" y="1" width="1.5" height="7" fill="#4f46e5" />
          <polygon points="60.5,1 65,3.5 60.5,6" fill="#f59e0b" />
        </svg>
      )
    },
    'Resume Writing': {
      categoryColor: 'bg-green-100 text-green-600',
      bg: 'from-green-50 to-emerald-100',
      illustration: (
        <svg viewBox="0 0 120 100" className="w-28 h-24 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="30" y="15" width="60" height="75" rx="6" fill="#d1fae5" stroke="#6ee7b7" strokeWidth="2" />
          <rect x="38" y="28" width="44" height="5" rx="2.5" fill="#a7f3d0" />
          <rect x="38" y="38" width="30" height="5" rx="2.5" fill="#a7f3d0" />
          <rect x="38" y="48" width="44" height="4" rx="2" fill="#a7f3d0" />
          <rect x="38" y="57" width="38" height="4" rx="2" fill="#a7f3d0" />
          <circle cx="82" cy="30" r="12" fill="#10b981" />
          <path d="M76 30 l4 4 l8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="54" cy="20" r="6" fill="#6ee7b7" />
        </svg>
      )
    },
    'Interview Tips': {
      categoryColor: 'bg-orange-100 text-orange-600',
      bg: 'from-orange-50 to-amber-100',
      illustration: (
        <svg viewBox="0 0 120 100" className="w-28 h-24 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="20" width="55" height="40" rx="10" fill="#fed7aa" />
          <path d="M20 60 l-8 10 l16 0 z" fill="#fed7aa" />
          <rect x="55" y="35" width="55" height="35" rx="10" fill="#fdba74" />
          <path d="M100 70 l8 10 l-16 0 z" fill="#fdba74" />
          <circle cx="38" cy="35" r="10" fill="#fb923c" />
          <path d="M28 65 q10-10 20 0" stroke="#fb923c" strokeWidth="3" fill="none" />
          <circle cx="82" cy="48" r="10" fill="#f97316" />
          <path d="M72 78 q10-10 20 0" stroke="#f97316" strokeWidth="3" fill="none" />
        </svg>
      )
    },
    'Industry Insights': {
      categoryColor: 'bg-indigo-100 text-indigo-600',
      bg: 'from-indigo-50 to-violet-100',
      illustration: (
        <svg viewBox="0 0 120 100" className="w-28 h-24 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="65" width="15" height="20" rx="3" fill="#c7d2fe" />
          <rect x="42" y="50" width="15" height="35" rx="3" fill="#a5b4fc" />
          <rect x="64" y="35" width="15" height="50" rx="3" fill="#818cf8" />
          <rect x="86" y="20" width="15" height="65" rx="3" fill="#6366f1" />
          <rect x="15" y="85" width="90" height="3" rx="1.5" fill="#e0e7ff" />
          <path d="M20 70 Q50 45 100 22" stroke="#4f46e5" strokeWidth="2.5" strokeDasharray="4 3" fill="none" />
          <polygon points="100,18 106,26 96,26" fill="#4f46e5" />
        </svg>
      )
    },
    'Skill Development': {
      categoryColor: 'bg-purple-100 text-purple-600',
      bg: 'from-purple-50 to-fuchsia-100',
      illustration: (
        <svg viewBox="0 0 120 100" className="w-28 h-24 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="50" r="30" fill="#e9d5ff" />
          <path d="M45 50 l10 10 l20 -20" stroke="#a855f7" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    'Salary Guide': {
      categoryColor: 'bg-emerald-100 text-emerald-600',
      bg: 'from-emerald-50 to-teal-100',
      illustration: (
        <svg viewBox="0 0 120 100" className="w-28 h-24 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="30" width="80" height="40" rx="4" fill="#a7f3d0" />
          <circle cx="60" cy="50" r="10" fill="#34d399" />
          <rect x="25" y="35" width="10" height="10" rx="2" fill="#34d399" />
          <rect x="85" y="55" width="10" height="10" rx="2" fill="#34d399" />
        </svg>
      )
    }
  };
  return map[category] || map['Career Guidance'];
};

/* ─── Component ─── */
const ResourcesPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  const { data: resourceData, isLoading: resourcesLoading } = useQuery({
    queryKey: ['resources-public'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/resources?limit=100`);
      return res.json();
    },
  });

  useEffect(() => {
    if (selectedResource) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedResource]);

  const apiResources = resourceData?.data?.filter(r => r.isPublished) || [];

  const handleSubscribe = async () => {
    if (!email.trim()) return toast.error('Please enter your email address.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error('Please enter a valid email.');
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/subscribers/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscribed(true);
        setEmail('');
        toast.success(data.message || 'Subscribed! Check your email.');
      } else {
        toast.error(data.message || 'Subscription failed.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = apiResources.filter(r => {
    const matchCat = activeCategory === 'all' || CATEGORIES.find(c => c.id === activeCategory)?.label === r.category;
    const matchSearch = !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.excerpt?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const displayedResources = showAll ? filtered : filtered.slice(0, 4);

  return (
    <div className="animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-sm text-gray-500 mt-0.5">Explore guides, tips and tools to accelerate your career journey.</p>
        </div>

        {/* Personalized guidance card */}
        <div className="hidden md:flex items-center gap-4 bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4 max-w-xs">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="#6366f1" strokeWidth="1.8">
              <path d="M9 12h6M9 16h6M9 8h6M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">Need personalized guidance?</p>
            <p className="text-xs text-gray-500 mt-0.5">Get career advice tailored to your goals and background.</p>
          </div>
          <button className="btn-primary btn-sm px-4 flex-shrink-0">Get Advice</button>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 mb-5 shadow-sm focus-within:ring-2 focus-within:ring-primary-400 focus-within:border-transparent transition-all">
        <Search size={15} className="text-gray-400 flex-shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search articles, guides and more..."
          className="flex-1 outline-none text-sm bg-transparent placeholder-gray-400"
        />
      </div>

      {/* ── Category Tabs ── */}
      <div className="flex gap-2 flex-wrap mb-7">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              activeCategory === cat.id
                ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Featured Resources ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">{showAll ? 'All Resources' : 'Featured Resources'}</h2>
        <button onClick={() => setShowAll(!showAll)} className="text-sm text-primary-600 font-medium hover:underline">
          {showAll ? 'View less' : 'View all'}
        </button>
      </div>

      {resourcesLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-white rounded-2xl border border-gray-100 shadow-sm h-64 skeleton"></div>
          ))}
        </div>
      ) : displayedResources.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {displayedResources.map(resource => {
            const style = getResourceStyle(resource.category);
            return (
              <div
                key={resource._id}
                onClick={() => setSelectedResource(resource)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden cursor-pointer"
              >
                {/* Illustration */}
                <div className={`h-36 bg-gradient-to-br ${style.bg} flex items-center justify-center relative`}>
                  {resource.isFeatured && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                      ★ Featured
                    </div>
                  )}
                  {resource.svgIcon ? (
                    <div dangerouslySetInnerHTML={{ __html: resource.svgIcon }} className="w-28 h-24 mx-auto flex items-center justify-center [&>svg]:w-full [&>svg]:h-full" />
                  ) : (
                    style.illustration
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full mb-2 ${style.categoryColor}`}>
                    {resource.category}
                  </span>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1.5 group-hover:text-primary-600 transition-colors leading-snug">
                    {resource.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                    {resource.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={11} />
                      {resource.readTime} min read
                    </span>
                    <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                      <Bookmark size={14} className="text-gray-400 hover:text-primary-500 transition-colors" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center mb-8">
          <p className="text-gray-500">No resources found in this category.</p>
        </div>
      )}

      {/* ── Popular Topics ── */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Popular Topics</h2>
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {POPULAR_TOPICS.map(({ id, label, icon: Icon, color }) => {
            const count = apiResources.filter(r => r.category === label).length;
            return (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group text-left"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm group-hover:text-primary-600 transition-colors leading-tight">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{count} Articles</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Newsletter ── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-5 flex flex-col md:flex-row items-center gap-5">
        {/* Icon */}
        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16">
            <circle cx="40" cy="40" r="38" fill="#ede9fe" />
            {/* envelope */}
            <rect x="16" y="28" width="48" height="34" rx="5" fill="#c4b5fd" />
            <path d="M16 33 L40 50 L64 33" stroke="#7c3aed" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
            {/* letter flying out top */}
            <rect x="28" y="14" width="24" height="18" rx="3" fill="#7c3aed" opacity="0.8" />
            <rect x="32" y="18" width="16" height="2" rx="1" fill="white" opacity="0.7" />
            <rect x="32" y="22" width="10" height="2" rx="1" fill="white" opacity="0.7" />
            <rect x="32" y="26" width="13" height="2" rx="1" fill="white" opacity="0.7" />
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-base">Never stop learning!</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Subscribe to get the latest career tips and resources delivered to your inbox.
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email address"
            type="email"
            className="input flex-1 md:w-64"
          />
          <button
            onClick={handleSubscribe}
            disabled={loading || subscribed}
            className="btn-primary px-6 flex-shrink-0 min-w-[120px] justify-center"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending…
              </span>
            ) : subscribed ? '✓ Subscribed!' : 'Subscribe'}
          </button>
        </div>
      </div>
      
      {/* Article Viewer Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-end sm:items-center sm:p-6 animate-fade-in backdrop-blur-sm overflow-hidden" onClick={() => setSelectedResource(null)}>
          <div 
            className="bg-white w-full max-w-4xl h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col relative animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <span className="text-xs font-medium px-2 py-1 rounded-md bg-indigo-50 text-indigo-700">{selectedResource.category}</span>
                <span className="text-xs text-gray-400 ml-3">{selectedResource.readTime} min read</span>
              </div>
              <button onClick={() => setSelectedResource(null)} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>
            
            {/* Scrollable Content Area */}
            <div className="p-6 sm:p-10 overflow-y-auto flex-1 group relative pb-32">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{selectedResource.title}</h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed font-medium">{selectedResource.excerpt}</p>
              
              <div className="prose prose-indigo max-w-none text-gray-700 leading-loose whitespace-pre-line">
                {selectedResource.content}
              </div>

              {/* Floating Toolbar (appears on hover of content area) */}
              <div className="fixed sm:absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 translate-y-10 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out z-10">
                <div className="bg-gray-900 text-white px-4 py-2.5 rounded-full shadow-xl shadow-gray-900/20 flex items-center gap-4">
                  <span className="text-sm font-medium mr-2 hidden sm:block">Helpful?</span>
                  <button onClick={() => toast.success('Link copied to clipboard!')} className="p-2 hover:bg-white/20 rounded-full transition-colors group/btn relative">
                    <Share2 size={16} />
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-[10px] px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity">Share</span>
                  </button>
                  <button onClick={() => toast.success('Bookmarked!')} className="p-2 hover:bg-white/20 rounded-full transition-colors group/btn relative">
                    <Bookmark size={16} />
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-[10px] px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity">Save</span>
                  </button>
                  <div className="w-px h-5 bg-gray-700 mx-1"></div>
                  <button onClick={() => {
                    const contentArea = document.querySelector('.prose');
                    if(contentArea) {
                      contentArea.scrollIntoView({behavior: 'smooth', block: 'start'});
                    }
                  }} className="text-xs font-semibold hover:text-primary-300 transition-colors flex items-center gap-1">
                    Back to Top
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
