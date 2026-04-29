/**
 * usePictureInPicture
 * ──────────────────
 * Xử lý Picture-in-Picture khi người dùng rời trang đang xem video.
 *
 * ⚠️ Giới hạn kỹ thuật với iframe cross-origin:
 *  - PiP API (`video.requestPictureInPicture()`) chỉ hoạt động với thẻ <video>
 *    trong cùng origin. Iframe embed từ nguồn khác (Ophim, VidStream...) bị
 *    giới hạn bởi same-origin policy.
 *
 * ✅ Giải pháp:
 *  1. Đảm bảo iframe có `allow="picture-in-picture"` → cho phép player BÊN TRONG
 *     iframe tự kích hoạt PiP (nếu player đó hỗ trợ).
 *  2. Gửi postMessage khi tab bị ẩn → hint player biết để bật PiP tự động.
 *  3. Hook này expose `isSupported` để UI có thể hiện thông báo phù hợp.
 *
 * Usage:
 *   const { isPlaying } = usePlayer();
 *   usePictureInPicture({ iframeRef, isPlaying });
 */
import { useEffect } from 'react';

/**
 * @param {Object} options
 * @param {React.RefObject} options.iframeRef - Ref trỏ tới thẻ <iframe>
 * @param {boolean} options.isPlaying - Video có đang chạy không
 * @param {boolean} [options.enabled=true] - Bật/tắt tính năng
 */
export function usePictureInPicture({ iframeRef, isPlaying, enabled = true } = {}) {
  // Kiểm tra browser support (chỉ relevant cho <video> cùng origin)
  const isApiSupported =
    typeof document !== 'undefined' && 'pictureInPictureEnabled' in document;

  useEffect(() => {
    if (!enabled || !isPlaying) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) return;

      // Cách 1: postMessage tới player trong iframe
      // Player như JWPlayer, Video.js, Plyr hỗ trợ lệnh này
      try {
        iframeRef?.current?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'pip', args: [] }),
          '*'
        );
      } catch { /* cross-origin blocking – expected */ }

      // Cách 2: postMessage theo format của một số player khác
      try {
        iframeRef?.current?.contentWindow?.postMessage(
          { type: 'pip-request', action: 'enter' },
          '*'
        );
      } catch { /* ignored */ }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [iframeRef, isPlaying, enabled]);

  return { isApiSupported };
}
