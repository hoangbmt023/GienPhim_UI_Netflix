import { useState } from 'react';
import { Link } from 'react-router-dom';
import { imgUrl } from '@/services/ophimApi';
import './SpotlightSection.css';

const stripHtml = (html = '') => html.replace(/<[^>]*>/g, '').trim();

const ChevronRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22">
    <path d="M8 5v14l11-7z" fill="currentColor" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="#f5c518">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const MapPinSvg = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

/**
 * SpotlightSection
 * Layout: [Info LEFT] [Thumb Grid RIGHT]
 * bg = poster_url (blur)  |  thumbs = thumb_url (portrait grid)
 */
export default function SpotlightSection({ title, items = [], seeAllLink, loading = false }) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (loading) {
    return (
      <div className="spotlight-section">
        <div className="spotlight-section__header">
          <h2 className="spotlight-section__title">{title}</h2>
        </div>
        <div className="spotlight-section__skeleton">
          <div className="skeleton" style={{ position: 'absolute', inset: 0, borderRadius: 14 }} />
        </div>
      </div>
    );
  }

  if (!items.length) return null;

  const movie     = items[activeIdx];
  const thumbs    = items.slice(0, 10);
  const desc      = stripHtml(movie?.content || movie?.description || '');
  const countries = movie?.country?.map(c => c.name).join(', ') || '';
  const imdb      = movie?.imdb?.vote_average;
  const tmdb      = movie?.tmdb?.vote_average;

  /* poster_url for blurred bg, fallback to thumb_url */
  const bgSrc = imgUrl(movie?.poster_url || movie?.thumb_url);

  return (
    <div className="spotlight-section">

      {/* Header */}
      <div className="spotlight-section__header">
        <h2 className="spotlight-section__title">{title}</h2>
        {seeAllLink && (
          <Link to={seeAllLink} className="spotlight-section__see-all">
            Xem toàn bộ <ChevronRight />
          </Link>
        )}
      </div>

      {/* Card */}
      <div className="spotlight-section__card">

        {/* Blurred poster backdrop */}
        <img
          className="spotlight-section__bg"
          src={bgSrc}
          alt=""
          aria-hidden="true"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />

        {/* Inner: info LEFT + thumbs RIGHT */}
        <div className="spotlight-section__inner">

          {/* LEFT – Info */}
          <div className="spotlight-section__info">

            <h3 className="spotlight-section__movie-title">{movie?.name}</h3>

            {movie?.origin_name && (
              <p className="spotlight-section__origin">{movie.origin_name}</p>
            )}

            {/* Badges */}
            <div className="spotlight-section__badges">
              {movie?.quality && (
                <span className="spotlight-section__badge spotlight-section__badge--quality">
                  {movie.quality}
                </span>
              )}
              {movie?.year && <span className="spotlight-section__badge">{movie.year}</span>}
              {movie?.episode_current && (
                <span className="spotlight-section__badge">{movie.episode_current}</span>
              )}
              {movie?.lang && <span className="spotlight-section__badge">{movie.lang}</span>}
            </div>

            {/* Genre tags */}
            {movie?.category?.length > 0 && (
              <div className="spotlight-section__tags">
                {movie.category.slice(0, 4).map((c) => (
                  <Link key={c.id} to={`/the-loai/${c.slug}`} className="spotlight-section__tag">
                    {c.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Meta */}
            {(movie?.time || countries || imdb > 0 || tmdb > 0) && (
              <div className="spotlight-section__meta">
                {movie?.time && <span>⏱ {movie.time}</span>}
                {countries   && <span><MapPinSvg /> {countries}</span>}
                {imdb > 0    && (
                  <span className="spotlight-section__meta-imdb">
                    <StarIcon /> {imdb.toFixed(1)}
                  </span>
                )}
                {!imdb && tmdb > 0 && (
                  <span className="spotlight-section__meta-tmdb">★ {tmdb.toFixed(1)}</span>
                )}
              </div>
            )}

            {/* Description */}
            {desc && <p className="spotlight-section__desc">{desc}</p>}

            {/* Play */}
            <Link to={`/phim/${movie?.slug}`} className="spotlight-section__play" aria-label="Xem phim">
              <PlayIcon /> Xem ngay
            </Link>

          </div>

          {/* RIGHT – Thumb grid */}
          <div className="spotlight-section__thumbs">
            {thumbs.map((m, i) => (
              <img
                key={m._id}
                className={`spotlight-section__thumb${i === activeIdx ? ' active' : ''}`}
                src={imgUrl(m.thumb_url)}
                alt={m.name}
                title={m.name}
                loading="lazy"
                onClick={() => setActiveIdx(i)}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ))}
          </div>

        </div>{/* /inner */}
      </div>{/* /card */}
    </div>
  );
}
