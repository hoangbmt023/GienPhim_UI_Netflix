import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMovieDetail, imgUrl } from "@/services/ophimApi";
import "./FranchiseSection.css";

export default function FranchiseSection({ franchise }) {
  const navigate = useNavigate();
  const [activeMovie, setActiveMovie] = useState(null);
  const [activeDetails, setActiveDetails] = useState(null);

  useEffect(() => {
    if (franchise && franchise.length > 0 && !activeMovie) {
      setActiveMovie(franchise[0]);
    }
  }, [franchise, activeMovie]);

  useEffect(() => {
    if (activeMovie) {
      getMovieDetail(activeMovie.slug)
        .then((r) => {
          if (r?.data?.item) {
            setActiveDetails(r.data.item);
          } else {
            setActiveDetails(activeMovie);
          }
        })
        .catch(() => setActiveDetails(activeMovie));
    }
  }, [activeMovie]);

  if (!franchise || franchise.length === 0) return null;
  const movie = activeDetails || activeMovie || franchise[0];

  return (
    <div className="franchise-section">
      <div className="franchise-section__inner">
        <h3 className="franchise-section__heading">
          Phim cùng bộ
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            width="16"
            height="16"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </h3>
        <div className="franchise-section__container">
          <div className="franchise-section__bg">
            <img src={imgUrl(movie.thumb_url || movie.poster_url)} alt="bg" />
            <div className="franchise-section__overlay"></div>
          </div>

          <div className="franchise-section__content">
            {/* Left Info */}
            <div className="franchise-section__info" key={movie.slug}>
              <h4 className="franchise-section__title">{movie.name}</h4>
              <p className="franchise-section__origin">{movie.origin_name}</p>

              <div className="franchise-section__badges">
                <span className="fc-badge fc-badge--imdb">IMDb 0</span>
                {movie.year && (
                  <span className="fc-badge fc-badge--year">{movie.year}</span>
                )}
                {movie.episode_current && (
                  <span className="fc-badge fc-badge--ep">
                    {movie.episode_current}
                  </span>
                )}
                {movie.quality && (
                  <span className="fc-badge fc-badge--quality">
                    {movie.quality}
                  </span>
                )}
              </div>

              <p className="franchise-section__desc">
                {movie.content
                  ? movie.content.replace(/<[^>]+>/g, "").slice(0, 200) + "..."
                  : "Theo dõi phần tiếp theo hoặc các bộ phim cùng series..."}
              </p>

              <button
                className="franchise-section__play"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  navigate(`/phim/${movie.slug}`);
                }}
                title="Xem phim"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Xem ngay
              </button>
            </div>

            {/* Right List */}
            <div className="franchise-section__list-wrapper">
              <div className="franchise-section__list">
                {franchise.map((m) => {
                  const isActive = m.slug === movie.slug;
                  return (
                    <div
                      key={m._id}
                      className={`fs-card ${isActive ? "active" : ""}`}
                      onMouseEnter={() => setActiveMovie(m)}
                      onClick={() => {
                        if (isActive) {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          navigate(`/phim/${m.slug}`);
                        } else {
                          setActiveMovie(m);
                        }
                      }}
                    >
                      <img src={imgUrl(m.thumb_url)} alt={m.name} />
                      <div className="fs-card__overlay">
                        <p>{m.name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
