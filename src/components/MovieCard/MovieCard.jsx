import { useState } from 'react';
import { Link } from 'react-router-dom';
import { imgUrl } from '@/services/ophimApi';
import './MovieCard.css';
import { getPath } from '@/utils/lang';

const FALLBACK = 'https://via.placeholder.com/160x240/1f1f1f/444?text=No+Image';

/* ── PlayIcon ── */
const PlaySvg = () => (
  <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
);

/* ═══════════════════════════════════════
   MovieCard  – standard card
   ═══════════════════════════════════════ */
export function MovieCard({ movie }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Link
      to={`${getPath('movie')}/${movie.slug}`}
      className="movie-card"
      aria-label={movie.name}
      title={movie.name}
    >
      <div className={`movie-card__img-wrap ${!imgLoaded ? 'skeleton' : ''}`}>
        <img
          className={`movie-card__img ${imgLoaded ? 'loaded' : 'loading'}`}
          src={imgUrl(movie.thumb_url)}
          alt={movie.name}
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          onError={(e) => { e.currentTarget.src = FALLBACK; setImgLoaded(true); }}
        />
        {movie.quality && (
          <span className="movie-card__quality">{movie.quality}</span>
        )}
        {movie.episode_current && (
          <span className="movie-card__ep">{movie.episode_current}</span>
        )}
        <div className="movie-card__overlay">
          <div className="movie-card__play">
            <PlaySvg />
          </div>
        </div>
      </div>

      <div className="movie-card__info">
        <p className="movie-card__name">{movie.name}</p>
        <p className="movie-card__origin">{movie.origin_name}</p>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════
   RankedCard – numbered ranking card
   ═══════════════════════════════════════ */
export function RankedCard({ movie, rank }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Link
      to={`${getPath('movie')}/${movie.slug}`}
      className="ranked-card"
      aria-label={`#${rank} ${movie.name}`}
      title={movie.name}
    >
      <span className="ranked-card__rank" aria-hidden="true">{rank}</span>
      <div className={`ranked-card__img-wrap ${!imgLoaded ? 'skeleton' : ''}`}>
        <img
          className={`ranked-card__img ${imgLoaded ? 'loaded' : 'loading'}`}
          src={imgUrl(movie.thumb_url)}
          alt={movie.name}
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          onError={(e) => { e.currentTarget.src = FALLBACK; setImgLoaded(true); }}
        />
        {movie.quality && (
          <span className="ranked-card__quality">{movie.quality}</span>
        )}
        {movie.episode_current && (
          <span className="ranked-card__ep">{movie.episode_current}</span>
        )}
      </div>
      <div className="ranked-card__info">
        <p className="ranked-card__name">{movie.name}</p>
        <p className="ranked-card__origin">{movie.origin_name}</p>
      </div>
    </Link>
  );
}

/* ── SkeletonRow ── */
export function SkeletonRow({ count = 7 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton-card__img" />
          <div className="skeleton skeleton-card__line1" />
          <div className="skeleton skeleton-card__line2" />
        </div>
      ))}
    </>
  );
}
