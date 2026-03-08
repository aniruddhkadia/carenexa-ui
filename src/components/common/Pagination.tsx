import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  totalCount: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions = [10, 50, 100, 200, 500],
  onPageChange,
  onPageSizeChange,
  totalCount,
}) => {
  const [jumpPage, setJumpPage] = React.useState(currentPage.toString());

  React.useEffect(() => {
    setJumpPage(currentPage.toString());
  }, [currentPage]);

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPage);
    if (!isNaN(p) && p > 0 && p <= totalPages) {
      onPageChange(p);
    } else {
      setJumpPage(currentPage.toString());
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 p-4 bg-white/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 backdrop-blur-sm">
      {/* Left: Stats */}
      <div className="flex items-center gap-3 justify-center md:justify-start">
        <div className="px-3 py-1.5 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
            Total: <span className="text-primary font-black">{totalCount}</span> records
          </span>
        </div>
      </div>

      {/* Center: Navigation Controls */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-1 p-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/50">
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="h-9 w-9 p-0 rounded-xl hover:bg-primary/5 hover:text-primary transition-all active:scale-90 disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </Button>

          <form onSubmit={handleJumpPage} className="flex items-center gap-2 px-3 border-x border-slate-100 dark:border-slate-700">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-tighter">Page</span>
            <input
              type="text"
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              className="w-10 h-8 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-black text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-inner"
            />
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-tighter">of {totalPages || 1}</span>
          </form>

          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => onPageChange(currentPage + 1)}
            className="h-9 w-9 p-0 rounded-xl hover:bg-primary/5 hover:text-primary transition-all active:scale-90 disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      {/* Right: Page Size Selector */}
      <div className="flex items-center gap-3 justify-center md:justify-end">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap hidden lg:block">Records per page:</label>
        <div className="relative group">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="appearance-none bg-white dark:bg-slate-800 pl-4 pr-10 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer shadow-sm min-w-[100px]"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                Show {opt}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-primary transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
