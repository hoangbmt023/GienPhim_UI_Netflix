import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePiP } from '@/contexts/PiPContext';
import './MiniPlayer.css';

/* ── Icons ── */
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const ExpandIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);
const PauseIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
  </svg>
);

export default function MiniPlayer() {
  const navigate = useNavigate();
  const { video, isPiP, pipIsPlaying, stopPiP, expandPiP, setPipPlaying } = usePiP();

  // State play/pause cục bộ, khởi tạo từ pipIsPlaying khi PiP bật
  const [localPlaying, setLocalPlaying] = useState(false);

  // Sync localPlaying theo pipIsPlaying mỗi khi PiP được kích hoạt
  useEffect(() => {
    if (isPiP) setLocalPlaying(pipIsPlaying);
  }, [isPiP, pipIsPlaying]);

  // Vị trí có thể kéo thả
  const [pos, setPos] = useState({ x: null, y: null }); // null = dùng CSS default
  const [isDragging, setIsDragging] = useState(false);
  const [visible, setVisible] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 });
  const playerRef = useRef(null);
  const iframeRef = useRef(null);

  // Animate vào/ra
  useEffect(() => {
    if (isPiP) {
      // Reset vị trí về góc mặc định mỗi khi PiP được kích hoạt
      setPos({ x: null, y: null });
      // Delay nhỏ để animation slide-up chạy
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isPiP]);

  /* ── Drag: Desktop (mouse) ── */
  const onMouseDown = useCallback((e) => {
    // Không drag nếu nhấn vào button
    if (e.target.closest('button')) return;
    e.preventDefault();

    const rect = playerRef.current.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: rect.left,
      startPosY: rect.top,
    };
    setIsDragging(true);

    const onMouseMove = (e) => {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const newX = dragRef.current.startPosX + dx;
      const newY = dragRef.current.startPosY + dy;

      // Giới hạn trong viewport
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const pw = playerRef.current?.offsetWidth || 340;
      const ph = playerRef.current?.offsetHeight || 230;

      setPos({
        x: Math.max(8, Math.min(vw - pw - 8, newX)),
        y: Math.max(8, Math.min(vh - ph - 8, newY)),
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  /* ── Drag: Mobile (touch) ── */
  const onTouchStart = useCallback((e) => {
    // Không drag khi nhấn vào button hoặc vùng video (để user tương tác với iframe)
    if (e.target.closest('button') || e.target.closest('.mini-player__screen')) return;

    const touch = e.touches[0];
    const rect = playerRef.current.getBoundingClientRect();
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startPosX: rect.left,
      startPosY: rect.top,
    };
    setIsDragging(true);
  }, []);

  const onTouchMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault(); // Ngăn scroll khi đang kéo player

    const touch = e.touches[0];
    const dx = touch.clientX - dragRef.current.startX;
    const dy = touch.clientY - dragRef.current.startY;
    const newX = dragRef.current.startPosX + dx;
    const newY = dragRef.current.startPosY + dy;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pw = playerRef.current?.offsetWidth || 280;
    const ph = playerRef.current?.offsetHeight || 195;

    setPos({
      x: Math.max(8, Math.min(vw - pw - 8, newX)),
      y: Math.max(8, Math.min(vh - ph - 8, newY)),
    });
  }, [isDragging]);

  const onTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  /* ── Toggle Play/Pause trong PiP ── */
  const handleTogglePlay = useCallback(() => {
    const next = !localPlaying;
    setLocalPlaying(next);
    setPipPlaying(next);
    // Gửi postMessage tới iframe (hỗ trợ player như vietsub.app, etc.)
    try {
      iframeRef.current?.contentWindow?.postMessage(
        { action: next ? 'play' : 'pause' },
        '*'
      );
    } catch (_) { }
  }, [localPlaying, setPipPlaying]);


  const handleExpand = useCallback(() => {
    expandPiP();
    navigate(`/xem-phim/${video.movieSlug}`);
  }, [expandPiP, navigate, video.movieSlug]);

  if (!isPiP || !video.embedUrl) return null;

  const style = pos.x !== null
    ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' }
    : {};

  return (
    <div
      ref={playerRef}
      className={`mini-player ${visible ? 'mini-player--visible' : ''} ${isDragging ? 'mini-player--dragging' : ''}`}
      style={style}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Thanh tiêu đề */}
      <div className="mini-player__bar">
        <div className="mini-player__info">
          <PlayIcon />
          <div className="mini-player__text">
            <span className="mini-player__title">{video.movieName}</span>
            {video.epName && video.epName !== 'Full' && (
              <span className="mini-player__ep">Tập {video.epName}</span>
            )}
          </div>
        </div>
        <div className="mini-player__actions">
          {/* Play / Pause trong PiP */}

          <button
            className="mini-player__btn mini-player__btn--expand"
            onClick={handleExpand}
            title="Mở rộng"
            aria-label="Mở lại trang xem phim"
          >
            <ExpandIcon />
          </button>
          <button
            className="mini-player__btn mini-player__btn--close"
            onClick={stopPiP}
            title="Đóng"
            aria-label="Đóng mini player"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Video iframe */}
      <div className="mini-player__screen">
        <iframe
          ref={iframeRef}
          src={video.embedUrl}
          title={video.movieName}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          referrerPolicy="no-referrer"
        />
        {/* KHÔNG có click-overlay – user không được click video để navigate */}
      </div>

      {/* Nhãn kéo thả */}
      <div className="mini-player__drag-hint">
        <span>⠿ Kéo để di chuyển</span>
      </div>
    </div>
  );
}
