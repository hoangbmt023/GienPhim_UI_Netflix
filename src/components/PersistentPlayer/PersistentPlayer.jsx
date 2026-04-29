/**
 * PersistentPlayer – 1 iframe duy nhất, không bao giờ unmount.
 *
 * Cơ chế chống reload:
 *  - Cấu trúc JSX LUÔN có 1 nhánh duy nhất (không if/else trả về khác nhau)
 *  - <div key="pp-screen"> giữ cùng DOM node bất kể isPiP thay đổi
 *  - Khi transitioning (slot chưa đo), container trốn offscreen (không return null)
 *  - => iframe không bao giờ unmount sau hasStarted=true
 */
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePiP } from '@/contexts/PiPContext';
import './PersistentPlayer.css';

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

export default function PersistentPlayer() {
  const navigate = useNavigate();
  const { video, isPiP, hasStarted, playerSlot, stopPiP } = usePiP();

  /**
   * effectiveIsPiP: float PiP chỉ khi isPiP=true VÀ không có WatchPage slot.
   * Khi WatchPage mounted (playerSlot != null) → luôn watch mode, không float.
   * Giải quyết: PiP không hiện trên WatchPage, expand tự động khi slot xuất hiện.
   */
  const effectiveIsPiP = isPiP && !playerSlot;

  const [slotRect, setSlotRect] = useState(null);
  const [pipPos, setPipPos] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [pipVisible, setPipVisible] = useState(false);
  const containerRef = useRef(null);
  const dragRef = useRef({});

  const isMobile = useMemo(() => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 1024, []);

  /* ── Đo slot khi watch mode ──
   * Đo bất kể isPiP vì effectiveIsPiP xử lý display.
   * Khi playerSlot có → đo ngay, sẵn sàng cho watch mode. */
  useEffect(() => {
    if (!hasStarted || !playerSlot) { setSlotRect(null); return; }

    const update = () => {
      const r = playerSlot.getBoundingClientRect();
      // Tính tọa độ tuyệt đối so với Document để dùng position: absolute
      // giúp video cuộn mượt mà cùng trang web mà không cần dùng scroll event.
      const absTop = r.top + window.pageYOffset;
      const absLeft = r.left + window.pageXOffset;
      setSlotRect({ top: absTop, left: absLeft, width: r.width, height: r.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(playerSlot);
    window.addEventListener('resize', update, { passive: true });

    const onOrientationChange = () => {
      // Safari cần một chút delay để layout ổn định sau khi xoay
      setTimeout(update, 100);
      setTimeout(update, 300);
    };
    window.addEventListener('orientationchange', onOrientationChange, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', onOrientationChange);
    };
  }, [playerSlot, hasStarted]);

  /* ── PiP slide-in animation ── */
  useEffect(() => {
    if (effectiveIsPiP) {
      setPipPos({ x: null, y: null });
      requestAnimationFrame(() => setPipVisible(true));
    } else {
      setPipVisible(false);
    }
  }, [effectiveIsPiP]);

  /* ── Drag mouse ── */
  const onMouseDown = useCallback((e) => {
    if (!effectiveIsPiP || e.target.closest('button') || e.target.closest('.pp-screen')) return;
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: rect.left, py: rect.top };
    setIsDragging(true);
    const onMove = (e) => {
      const vw = window.innerWidth, vh = window.innerHeight;
      const pw = containerRef.current?.offsetWidth || 340;
      const ph = containerRef.current?.offsetHeight || 230;
      setPipPos({
        x: Math.max(8, Math.min(vw - pw - 8, dragRef.current.px + e.clientX - dragRef.current.sx)),
        y: Math.max(8, Math.min(vh - ph - 8, dragRef.current.py + e.clientY - dragRef.current.sy)),
      });
    };
    const onUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [isPiP]);

  /* ── Drag touch ── */
  const onTouchStart = useCallback((e) => {
    if (!effectiveIsPiP || e.target.closest('button') || e.target.closest('.pp-screen')) return;
    const t = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    dragRef.current = { sx: t.clientX, sy: t.clientY, px: rect.left, py: rect.top };
    setIsDragging(true);
  }, [isPiP]);

  const onTouchMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    const t = e.touches[0];
    const vw = window.innerWidth, vh = window.innerHeight;
    const pw = containerRef.current?.offsetWidth || 300;
    const ph = containerRef.current?.offsetHeight || 210;
    setPipPos({
      x: Math.max(8, Math.min(vw - pw - 8, dragRef.current.px + t.clientX - dragRef.current.sx)),
      y: Math.max(8, Math.min(vh - ph - 8, dragRef.current.py + t.clientY - dragRef.current.sy)),
    });
  }, [isDragging]);

  const onTouchEnd = useCallback(() => setIsDragging(false), []);

  /* ── Expand PiP → WatchPage ──
   * Chỉ navigate. Khi WatchPage mount → slot register → effectiveIsPiP=false tự động.
   * Không cần gọi expandPiP() vì playerSlot != null sẽ override isPiP. */
  const handleExpand = useCallback(() => {
    navigate(`/xem-phim/${video.movieSlug}`);
  }, [navigate, video.movieSlug]);

  /* ══════════════════════════════════════════
     Tính style container theo mode
     KHÔNG return null khi hasStarted=true
     → iframe sống mãi, không reload
  ══════════════════════════════════════════ */
  const containerStyle = useMemo(() => {
    // Chưa bắt đầu hoặc chưa có video → ẩn hoàn toàn
    if (!hasStarted || !video.embedUrl) return { display: 'none' };

    if (effectiveIsPiP) {
      const pos = pipPos.x !== null
        ? { left: pipPos.x, top: pipPos.y, right: 'auto', bottom: 'auto' }
        : { bottom: 20, right: 20 };
      return {
        position: 'fixed',
        width: 340,
        zIndex: 9999,
        borderRadius: 12,
        background: '#0e0e0e',
        overflow: 'hidden',
        boxShadow: isDragging
          ? '0 20px 60px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.15)'
          : '0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)',
        transform: pipVisible ? 'translateY(0) scale(1)' : 'translateY(120%) scale(0.9)',
        opacity: pipVisible ? 1 : 0,
        transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
        userSelect: 'none', WebkitUserSelect: 'none',
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'default',
        ...pos,
      };
    }

    if (slotRect) {
      // Watch mode: dùng absolute để cuộn tự nhiên theo document
      const isMobile = window.innerWidth <= 767;
      return {
        position: 'absolute',
        top: 0,
        left: 0,
        width: slotRect.width,
        height: slotRect.height,
        transform: `translate3d(${slotRect.left}px, ${slotRect.top}px, 0)`,
        zIndex: 10,
        overflow: 'hidden',
        borderRadius: isMobile ? 0 : 12,
        background: '#000',
        pointerEvents: 'none',    // iframe tự xử lý events
      };
    }

    // Đang chuyển (slot chưa đo xong) → giữ iframe sống, ẩn ra ngoài viewport
    return {
      position: 'fixed',
      top: -9999, left: -9999,
      width: 1, height: 1,
      overflow: 'hidden', opacity: 0,
      pointerEvents: 'none', zIndex: -1,
    };
  }, [hasStarted, video.embedUrl, effectiveIsPiP, slotRect, pipPos, pipVisible, isDragging]);

  /* Không render gì nếu chưa có URL video */
  if (!video.embedUrl) return null;

  /**
   * iframeSrc: thêm autoplay=1 vào URL.
   * - URL được tính 1 lần khi video.embedUrl thay đổi.
   * - Không thay đổi giữa các lần render khác → iframe không reload.
   * - autoplay=1 hoạt động trên desktop và iPhone khi có user gesture trước.
   */
  const sep = video.embedUrl.includes('?') ? '&' : '?';
  const iframeSrc = `${video.embedUrl}${sep}autoplay=1`;

  const screenStyle = effectiveIsPiP
    ? { position: 'relative', aspectRatio: '16/9', width: '100%', background: '#000', touchAction: 'auto' }
    : { position: 'absolute', inset: 0, pointerEvents: 'auto', touchAction: 'auto' };

  return (
    <div
      ref={containerRef}
      className={`pp ${effectiveIsPiP ? 'pp--pip' : 'pp--watch'}`}
      style={containerStyle}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Thanh điều khiển PiP – chỉ hiện khi PiP mode */}
      {effectiveIsPiP && (
        <div key="pp-bar" className="pp-bar">
          <div className="pp-info">
            <div className="pp-text">
              <span className="pp-title">{video.movieName}</span>
              {video.epName && video.epName !== 'Full' && (
                <span className="pp-ep">Tập {video.epName}</span>
              )}
            </div>
          </div>
          <div className="pp-actions">
            <button className="pp-btn pp-btn--expand" onClick={handleExpand}
              title="Mở rộng" aria-label="Mở lại trang xem phim">
              <ExpandIcon />
            </button>
            <button className="pp-btn pp-btn--close" onClick={stopPiP}
              title="Đóng" aria-label="Đóng player">
              <CloseIcon />
            </button>
          </div>
        </div>
      )}

      {/*
        ★ KEY = "pp-screen" → React LUÔN reuse DOM node này ★
        Dù isPiP thay đổi, div này (và iframe bên trong) không bao giờ unmount.
        Chỉ mount iframe khi hasStarted=true để tránh chạy ngầm và autoplay chuẩn xác.
      */}
      <div key="pp-screen" className="pp-screen" style={screenStyle}>
        {hasStarted && (
          <iframe
            src={iframeSrc}
            title={video.movieName}
            allowFullScreen
            disablePictureInPicture
            allow="accelerometer; autoplay *; clipboard-write; encrypted-media; gyroscope; fullscreen"
            referrerPolicy="no-referrer"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              border: 'none',
            }}
          />
        )}
      </div>

      {effectiveIsPiP && (
        <div key="pp-drag-hint" className="pp-drag-hint">
          <span>⠿ Kéo để di chuyển</span>
        </div>
      )}
    </div>
  );
}
