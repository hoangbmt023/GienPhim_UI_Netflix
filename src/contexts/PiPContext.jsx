/**
 * PiPContext – Quản lý Persistent iframe player toàn cục
 *
 * Logic hiển thị (trong PersistentPlayer):
 *   effectiveIsPiP = isPiP && !playerSlot
 *   - playerSlot != null (WatchPage mounted) → LUÔN watch mode, không float
 *   - playerSlot == null && isPiP       → PiP mode (floating)
 *   - playerSlot == null && !isPiP      → offscreen / hidden
 *
 * Tránh stale closure: startPiP dùng ref để đọc hasStarted mới nhất.
 */
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const PiPContext = createContext(null);

export function PiPProvider({ children }) {
  const [video, setVideoState] = useState({
    embedUrl: '', movieName: '', movieSlug: '', epName: '',
  });
  const [isPiP, setIsPiP] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [playerSlot, setPlayerSlot] = useState(null);

  /* ── Refs để tránh stale closure trong cleanup ── */
  const hasStartedRef = useRef(false);
  const videoRef = useRef({ embedUrl: '' });

  useEffect(() => { hasStartedRef.current = hasStarted; }, [hasStarted]);
  useEffect(() => { videoRef.current = video; }, [video]);

  /* ── Slot registration ── */
  const registerSlot = useCallback((el) => {
    setPlayerSlot(el instanceof Element ? el : null);
  }, []);

  /* ── Video registration ── */
  const registerVideo = useCallback((embedUrl, movieName, movieSlug, epName = '') => {
    setVideoState(prev => {
      // Reset banner Play mỗi khi đổi tập hoặc đổi phim
      if (prev.embedUrl !== embedUrl) {
        setHasStarted(false);
      }
      return { embedUrl, movieName, movieSlug, epName };
    });
  }, []);

  /** WatchPage overlay click → bắt đầu phát */
  const startVideo = useCallback(() => setHasStarted(true), []);

  /**
   * WatchPage cleanup → bật PiP.
   * Dùng ref để đọc giá trị MỚI NHẤT, tránh stale closure.
   */
  const startPiP = useCallback(() => {
    if (hasStartedRef.current && videoRef.current.embedUrl) {
      setIsPiP(true);
    }
  }, []); // deps rỗng = hàm stable, không bao giờ stale

  /** Đóng PiP hoàn toàn */
  const stopPiP = useCallback(() => {
    setIsPiP(false);
    setHasStarted(false);
    setVideoState({ embedUrl: '', movieName: '', movieSlug: '', epName: '' });
  }, []);

  /**
   * Không cần gọi thủ công nữa.
   * PersistentPlayer tự dùng effectiveIsPiP = isPiP && !playerSlot.
   * Giữ lại để tương thích nếu cần.
   */
  const expandPiP = useCallback(() => setIsPiP(false), []);

  return (
    <PiPContext.Provider value={{
      video, isPiP, hasStarted,
      playerSlot,
      registerSlot,
      registerVideo, startVideo,
      startPiP, stopPiP, expandPiP,
    }}>
      {children}
    </PiPContext.Provider>
  );
}

export const usePiP = () => {
  const ctx = useContext(PiPContext);
  if (!ctx) throw new Error('usePiP must be used within PiPProvider');
  return ctx;
};
