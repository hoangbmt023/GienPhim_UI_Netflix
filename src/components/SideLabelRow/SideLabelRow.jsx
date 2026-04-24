import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { MovieCard } from '@/components/MovieCard/MovieCard';
import { SkeletonRow } from '@/components/MovieCard/MovieCard';
import './SideLabelRow.css';

const ChevronRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

/**
 * SideLabelRow – country/section row
 * Left: bold red title + "Xem toàn bộ" link
 * Right: horizontal scrollable movie cards
 *
 * Props:
 *   title      {string}  – section label
 *   items      {Array}   – movie list
 *   loading    {boolean}
 *   seeAllLink {string}  – href
 *   skeletonCount {number}
 */
export default function SideLabelRow({
  title,
  items = [],
  loading = false,
  seeAllLink,
  skeletonCount = 6,
}) {
  const listRef = useRef(null);

  const scroll = (dir) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 172 * 5, behavior: 'smooth' });
  };

  return (
    <div className="side-row">
      {/* Left label */}
      <div className="side-row__label">
        <h2 className="side-row__title">{title}</h2>
        {seeAllLink && (
          <Link to={seeAllLink} className="side-row__see-all">
            Xem toàn bộ <ChevronRight />
          </Link>
        )}
      </div>

      {/* Right movie list */}
      <div className="side-row__movies">
        <div className="side-row__scroll-wrapper">
          <button
            className="side-row__nav side-row__nav--prev"
            onClick={() => scroll(-1)}
            aria-label="Cuộn trái"
          >
            ‹
          </button>

          <div className="side-row__list" ref={listRef}>
            {loading ? (
              <SkeletonRow count={skeletonCount} />
            ) : (
              items.map((m) => <MovieCard key={m._id} movie={m} />)
            )}
          </div>

          <button
            className="side-row__nav side-row__nav--next"
            onClick={() => scroll(1)}
            aria-label="Cuộn phải"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
