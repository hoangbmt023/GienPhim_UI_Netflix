import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { MovieCard, RankedCard, SkeletonRow } from '@/components/MovieCard/MovieCard';
import './MovieRow.css';

const ChevronRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

/**
 * MovieRow – reusable horizontal scroll row
 *
 * Props:
 *  title      {string}   – section title
 *  items      {Array}    – movie list
 *  loading    {boolean}  – show skeleton
 *  seeAllLink {string}   – "Xem toàn bộ" href
 *  ranked     {boolean}  – use RankedCard instead of MovieCard
 *  skeletonCount {number} – number of skeleton cards to show
 */
export default function MovieRow({
  title,
  items = [],
  loading = false,
  seeAllLink,
  ranked = false,
  skeletonCount = 7,
}) {
  const listRef = useRef(null);

  const scroll = (dir) => {
    const el = listRef.current;
    if (!el) return;
    /* scroll by ~5 card widths */
    const cardW = ranked ? 163 : 172;
    el.scrollBy({ left: dir * cardW * 5, behavior: 'smooth' });
  };

  return (
    <div className="movie-row">
      {/* Header */}
      <div className="movie-row__header">
        <h2 className="movie-row__title">{title}</h2>
        {seeAllLink && (
          <Link to={seeAllLink} className="movie-row__see-all">
            Xem toàn bộ <ChevronRight />
          </Link>
        )}
      </div>

      {/* Scroll area */}
      <div className="movie-row__scroll-wrapper">
        <button
          className="movie-row__nav movie-row__nav--prev"
          onClick={() => scroll(-1)}
          aria-label="Cuộn về trái"
        >
          ‹
        </button>

        <div className="movie-row__list" ref={listRef}>
          {loading ? (
            <SkeletonRow count={skeletonCount} />
          ) : ranked ? (
            items.map((m, i) => (
              <RankedCard key={m._id} movie={m} rank={i + 1} />
            ))
          ) : (
            items.map((m) => (
              <MovieCard key={m._id} movie={m} />
            ))
          )}
        </div>

        <button
          className="movie-row__nav movie-row__nav--next"
          onClick={() => scroll(1)}
          aria-label="Cuộn về phải"
        >
          ›
        </button>
      </div>
    </div>
  );
}
