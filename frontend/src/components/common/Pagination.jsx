import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, pages, onPageChange }) => {
  if (!pages || pages <= 1) return null;

  const getPageNumbers = () => {
    const nums = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) nums.push(i);
    if (nums[0] > 1) { if (nums[0] > 2) nums.unshift('...'); nums.unshift(1); }
    if (nums[nums.length - 1] < pages) { if (nums[nums.length - 1] < pages - 1) nums.push('...'); nums.push(pages); }
    return nums;
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <ChevronLeft size={16} />
      </button>

      {getPageNumbers().map((num, i) => (
        <button key={i}
          onClick={() => typeof num === 'number' && onPageChange(num)}
          disabled={num === '...'}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
            num === page ? 'bg-primary-600 text-white shadow-sm' :
            num === '...' ? 'text-gray-400 cursor-default' :
            'border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {num}
        </button>
      ))}

      <button onClick={() => onPageChange(page + 1)} disabled={page === pages}
        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
