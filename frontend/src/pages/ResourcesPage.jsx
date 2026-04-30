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
    <div className="page-container py-4 sm:py-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
        <p className="text-sm text-gray-500 mt-0.5">Explore guides, tips and tools to accelerate your career journey.</p>
      </div>

      {/* ── Sticky Search & Filters ── */}
      <div className="sticky top-[60px] z-20 bg-gray-50 pt-2 pb-3 mb-6">
        {/* ── Search ── */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 mb-4 shadow-sm focus-within:ring-2 focus-within:ring-primary-400 focus-within:border-transparent transition-all">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles, guides and more..."
            className="flex-1 outline-none text-sm bg-transparent placeholder-gray-400"
          />
        </div>

        {/* ── Category Tabs ── */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                activeCategory === cat.id
                  ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Personalized guidance banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 to-white border border-indigo-100 rounded-2xl shadow-sm px-6 py-5 mb-8 w-full">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Target size={24} className="text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-base">Need personalized guidance?</p>
            <p className="text-sm text-gray-500 mt-0.5">Get career advice tailored to your unique goals and background.</p>
          </div>
        </div>
        <button className="btn-primary px-6 flex-shrink-0 w-full md:w-auto shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
          Get 1-on-1 Advice
        </button>
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
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group overflow-hidden cursor-pointer flex flex-col"
              >
                {/* Illustration */}
                <div className={`aspect-video w-full bg-gradient-to-br ${style.bg} flex items-center justify-center relative`}>
                  {resource.isFeatured && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                      ★ Featured
                    </div>
                  )}
                  {resource.svgIcon ? (
                    <div dangerouslySetInnerHTML={{ __html: resource.svgIcon }} className="w-24 h-24 mx-auto flex items-center justify-center [&>svg]:w-full [&>svg]:h-full" />
                  ) : (
                    style.illustration
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="mb-2">
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${style.categoryColor}`}>
                      {resource.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1.5 group-hover:text-primary-600 transition-colors leading-snug">
                    {resource.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
                    {resource.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                    <span className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
                      <Clock size={12} />
                      {resource.readTime} min read
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toast.success('Saved to your bookmarks!'); }} 
                      className="p-1.5 -mr-1.5 rounded-lg hover:bg-gray-100 transition-colors group/bookmark"
                    >
                      <Bookmark size={15} className="text-gray-400 group-hover/bookmark:text-primary-500 group-hover/bookmark:fill-primary-500 group-hover/bookmark:scale-110 group-hover/bookmark:-translate-y-0.5 active:scale-90 transition-all duration-300" />
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
      
      {/* Full-Screen Article Reader */}
      {selectedResource && (
        <div 
          id="resource-reader-overlay" 
          className="fixed inset-0 bg-white z-[100] overflow-y-auto animate-fade-in"
          onScroll={(e) => {
             const { scrollTop, scrollHeight, clientHeight } = e.target;
             const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
             const progressBar = document.getElementById('progress-bar');
             if (progressBar) progressBar.style.width = `${scrolled || 0}%`;
          }}
        >
          
          {/* Reading Progress Bar */}
          <div className="sticky top-0 left-0 w-full h-1.5 bg-gray-100 z-50">
            <div id="progress-bar" className="h-full bg-primary-600 transition-all duration-150 ease-out" style={{ width: '0%' }}></div>
          </div>

          {/* Sticky Header w/ Back Button */}
          <div className="sticky top-1.5 bg-white/95 backdrop-blur-md border-b border-gray-100 z-40 px-4 sm:px-8 py-4 flex items-center justify-between shadow-sm">
            <button onClick={() => setSelectedResource(null)} className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-primary-600 transition-colors group">
              <span className="text-xl leading-none group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Resources
            </button>
            <div className="flex items-center gap-3">
              <button onClick={() => toast.success('Link copied!')} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                <Share2 size={18} />
              </button>
              <button onClick={() => toast.success('Bookmarked!')} className="p-2 text-gray-400 hover:text-primary-500 hover:fill-primary-50 bg-gray-50 hover:bg-primary-50 rounded-full transition-colors">
                <Bookmark size={18} />
              </button>
            </div>
          </div>

          {/* Centered Content Well */}
          <div className="max-w-[800px] mx-auto px-6 py-10 sm:py-16">
            
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 font-medium">
              <span className="hover:text-primary-600 cursor-pointer" onClick={() => setSelectedResource(null)}>Resources</span>
              <ChevronRight size={14} className="text-gray-300" />
              <span className="text-gray-700">{selectedResource.category}</span>
            </div>

            {/* Article Header */}
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-6 leading-[1.1] tracking-tight">{selectedResource.title}</h1>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-10 pb-8 border-b border-gray-100">
               <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-full font-medium text-gray-600">
                 <Clock size={14} className="text-gray-400" /> {selectedResource.readTime} min read
               </span>
               <span className="flex items-center gap-1.5 bg-primary-50 border border-primary-100 text-primary-700 px-3.5 py-1.5 rounded-full font-semibold">
                 {selectedResource.category}
               </span>
            </div>

            {/* Feature Image / Illustration */}
            <div className={`w-full aspect-[21/9] sm:aspect-video rounded-3xl mb-12 flex items-center justify-center shadow-inner overflow-hidden relative bg-gradient-to-br ${getResourceStyle(selectedResource.category).bg}`}>
               {selectedResource.svgIcon ? (
                  <div dangerouslySetInnerHTML={{ __html: selectedResource.svgIcon }} className="w-48 h-48 sm:w-64 sm:h-64 [&>svg]:w-full [&>svg]:h-full opacity-90" />
               ) : (
                  <div className="scale-125 sm:scale-150 opacity-90">
                    {getResourceStyle(selectedResource.category).illustration}
                  </div>
               )}
            </div>

            {/* Excerpt Summary */}
            <p className="text-xl text-slate-600 leading-relaxed font-medium mb-12">
              {selectedResource.excerpt}
            </p>

            {/* Table of Contents Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-8 mb-12 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                <FileText size={16} className="text-primary-500" /> What's in this guide
              </h3>
              <ul className="space-y-4 text-primary-600 font-medium">
                 <li className="flex items-start gap-3 hover:text-primary-800 cursor-pointer transition-colors group">
                   <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs flex-shrink-0 group-hover:bg-primary-200">1</span> 
                   <span className="mt-0.5">Introduction & Core Concepts</span>
                 </li>
                 <li className="flex items-start gap-3 hover:text-primary-800 cursor-pointer transition-colors group">
                   <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs flex-shrink-0 group-hover:bg-primary-200">2</span> 
                   <span className="mt-0.5">Key Strategies and Frameworks</span>
                 </li>
                 <li className="flex items-start gap-3 hover:text-primary-800 cursor-pointer transition-colors group">
                   <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs flex-shrink-0 group-hover:bg-primary-200">3</span> 
                   <span className="mt-0.5">Common Pitfalls to Avoid</span>
                 </li>
                 <li className="flex items-start gap-3 hover:text-primary-800 cursor-pointer transition-colors group">
                   <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs flex-shrink-0 group-hover:bg-primary-200">4</span> 
                   <span className="mt-0.5">Actionable Next Steps</span>
                 </li>
              </ul>
            </div>

            {/* Main Content Body - Typography Rules Applied */}
            <div className="prose prose-lg prose-headings:text-slate-900 prose-headings:font-bold prose-headings:mt-14 prose-headings:mb-6 prose-p:mb-8 prose-p:leading-[1.8] prose-p:text-[18px] prose-p:text-gray-700 prose-a:text-primary-600 prose-li:text-gray-700 max-w-none whitespace-pre-line">
              {selectedResource.content}
            </div>
            
            {/* Callout Box Example (Visual Break) */}
            <div className="my-14 bg-blue-50 border-l-4 border-blue-500 p-6 sm:p-8 rounded-r-2xl">
              <h4 className="flex items-center gap-2 font-bold text-blue-900 mb-3 text-lg">
                <Target size={20} className="text-blue-600" /> Pro Tip
              </h4>
              <p className="text-blue-800 text-[18px] leading-[1.8]">
                Consistency is key. Applying these techniques daily will yield much better results than trying to cram everything in a single weekend. Take it one step at a time, and don't hesitate to bookmark this guide for future reference.
              </p>
            </div>

          </div>

          {/* Engagement Footer */}
          <div className="bg-gray-50 border-t border-gray-200 mt-10">
            <div className="max-w-[800px] mx-auto px-6 py-16 sm:py-24">
              <h3 className="text-2xl font-extrabold text-slate-900 mb-8">Keep Learning</h3>
              <div className="grid sm:grid-cols-2 gap-6 mb-16">
                 {apiResources.filter(r => r.category === selectedResource.category && r._id !== selectedResource._id).slice(0, 2).map(r => (
                    <div key={r._id} onClick={() => {
                        document.getElementById('resource-reader-overlay').scrollTop = 0;
                        setSelectedResource(r);
                    }} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-primary-300 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                       <span className="inline-block text-[10px] font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full uppercase tracking-wider mb-3">{r.category}</span>
                       <h4 className="font-bold text-gray-900 text-lg mb-3 group-hover:text-primary-600 transition-colors leading-tight">{r.title}</h4>
                       <span className="text-sm font-medium text-gray-400 flex items-center gap-1.5"><Clock size={14}/> {r.readTime} min read</span>
                    </div>
                 ))}
                 
                 {/* Fallback if no related articles exist */}
                 {apiResources.filter(r => r.category === selectedResource.category && r._id !== selectedResource._id).length === 0 && (
                   <div className="sm:col-span-2 text-center py-8 text-gray-500 font-medium">
                     No other articles in this category yet. Check back soon!
                   </div>
                 )}
              </div>

              {/* The "Find Jobs" CTA */}
              <div className="bg-gradient-to-br from-indigo-600 via-primary-600 to-purple-700 rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Ready to put these tips to the test?</h3>
                  <p className="text-indigo-100 text-lg sm:text-xl mb-10 max-w-lg mx-auto font-medium">
                    Browse thousands of open roles matching your skills and start applying today.
                  </p>
                  <Link to="/jobs" className="inline-flex items-center justify-center bg-white text-indigo-700 font-extrabold px-8 py-4 rounded-xl hover:bg-gray-50 hover:scale-105 transition-all shadow-xl text-lg">
                    Browse Open Jobs &rarr;
                  </Link>
                </div>
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                  <svg className="absolute w-64 h-64 -top-20 -left-20 text-white fill-current" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50"/></svg>
                  <svg className="absolute w-96 h-96 -bottom-32 -right-32 text-white fill-current" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50"/></svg>
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
