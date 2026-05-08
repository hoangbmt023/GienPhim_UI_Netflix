import React from 'react';
import './Pagination.css';
import { useLang } from '@/utils/lang';

const ChevronL = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronR = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default function Pagination({ currentPage, totalPages, pageRanges = 5, onPageChange, showInfo = true }) {
  const { t } = useLang();
  if (totalPages <= 1) return null;

  const pageRange = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 767;
    const effectiveRange = isMobile ? 3 : pageRanges;
    const total = totalPages;
    const cur = currentPage;
    const half = Math.floor(effectiveRange / 2);
    const range = [];

    for (let i = Math.max(1, cur - half); i <= Math.min(total, cur + half); i++) {
      range.push(i);
    }
    
    if (range[0] > 2) { range.unshift('...'); range.unshift(1); }
    else if (range[0] === 2) { range.unshift(1); }
    
    if (range[range.length - 1] < total - 1) { range.push('...'); range.push(total); }
    else if (range[range.length - 1] === total - 1) { range.push(total); }

    return range;
  };

  return (
    <div className="gp-pagination">
      {/* Hide << on mobile */}
      <button
        className="gp-pg-btn gp-pg-btn--arrow gp-pg-hide-mobile"
        onClick={() => onPageChange(1)}
        disabled={currentPage <= 1}
        title={t.common.firstPage}
      >
        «
      </button>

      <button
        className="gp-pg-btn gp-pg-btn--arrow"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label={t.common.prevPage}
      >
        <ChevronL />
      </button>

      {pageRange().map((p, i) =>
        p === '...' ? (
          <span key={`d-${i}`} className="gp-pg-dots">…</span>
        ) : (
          <button
            key={`p-${p}`}
            className={`gp-pg-btn${p === currentPage ? ' active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        className="gp-pg-btn gp-pg-btn--arrow"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label={t.common.nextPage}
      >
        <ChevronR />
      </button>

      {/* Hide >> on mobile */}
      <button
        className="gp-pg-btn gp-pg-btn--arrow gp-pg-hide-mobile"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage >= totalPages}
        title={t.common.lastPage}
      >
        »
      </button>

      {showInfo && (
        <span className="gp-pg-info">
          {t.common.pageInfo(currentPage, totalPages)}
        </span>
      )}
    </div>
  );
}
