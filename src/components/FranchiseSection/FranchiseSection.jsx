import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getMovieDetail, imgUrl } from "@/services/ophimApi";
import "./FranchiseSection.css";

export default function FranchiseSection({ franchise }) {
  const navigate = useNavigate();
  const [activeMovie, setActiveMovie] = useState(null);
  const [activeDetails, setActiveDetails] = useState(null);
  // Dùng để trigger crossfade animation khi đổi phim
  const [contentKey, setContentKey] = useState(0);
  const [bgSrc, setBgSrc] = useState('');
  const [bgVisible, setBgVisible] = useState(true);
  const fetchRef = useRef(null); // Hủy fetch cũ khi chuyển phim nhanh

  useEffect(() => {
    if (franchise && franchise.length > 0 && !activeMovie) {
      setActiveMovie(franchise[0]);
    }
  }, [franchise, activeMovie]);

  useEffect(() => {
    if (!activeMovie) return;

    // Huỷ fetch đang chạy nếu người dùng chuyển phim nhanh
    const abortController = new AbortController();
    fetchRef.current = abortController;

    // Crossfade background: mờ → đổi ảnh → hiện
    setBgVisible(false);
    const bgTimer = setTimeout(() => {
      setBgSrc(imgUrl(activeMovie.thumb_url || activeMovie.poster_url));
      setBgVisible(true);
    }, 250);

    getMovieDetail(activeMovie.slug)
      .then((r) => {
        if (abortController.signal.aborted) return;
        const details = r?.data?.item || activeMovie;
        setActiveDetails(details);
        setContentKey(k => k + 1); // trigger re-animation
      })
      .catch(() => {
        if (!abortController.signal.aborted) {
          setActiveDetails(activeMovie);
          setContentKey(k => k + 1);
        }
      });

    return () => {
      abortController.abort();
      clearTimeout(bgTimer);
    };
  }, [activeMovie]);

  if (!franchise || franchise.length === 0) return null;
  const movie = activeDetails || activeMovie || franchise[0];

  return (
    <div className="franchise-section">
      <div className="franchise-section__inner">
        <h3 className="franchise-section__heading">
          Phim cùng bộ
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </h3>
        <div className="franchise-section__container">
          {/* Background crossfade */}
          <div className="franchise-section__bg">
            <img
              src={bgSrc || imgUrl(movie.thumb_url || movie.poster_url)}
              alt="bg"
              className={bgVisible ? 'visible' : ''}
            />
            <div className="franchise-section__overlay"></div>
          </div>

          <div className="franchise-section__content">
            {/* Left Info – re-animate khi đổi phim bằng contentKey */}
            <div className="franchise-section__info" key={contentKey}>
              <h4 className="franchise-section__title">{movie.name}</h4>
              <p className="franchise-section__origin">{movie.origin_name}</p>

              <div className="franchise-section__badges">
                {movie.year && (
                  <span className="fc-badge fc-badge--year">{movie.year}</span>
                )}
                {movie.episode_current && (
                  <span className="fc-badge fc-badge--ep">{movie.episode_current}</span>
                )}
                {movie.quality && (
                  <span className="fc-badge fc-badge--quality">{movie.quality}</span>
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
                  const isActive = m.slug === (activeMovie?.slug || franchise[0]?.slug);
                  return (
                    <div
                      key={m._id}
                      className={`fs-card ${isActive ? "active" : ""}`}
                      onMouseEnter={() => !isActive && setActiveMovie(m)}
                      onClick={() => {
                        if (isActive) {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          navigate(`/phim/${m.slug}`);
                        } else {
                          setActiveMovie(m);
                        }
                      }}
                    >
                      <img src={imgUrl(m.thumb_url)} alt={m.name} loading="lazy" />
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
