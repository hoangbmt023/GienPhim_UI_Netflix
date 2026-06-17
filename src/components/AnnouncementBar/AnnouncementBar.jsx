import React, { useState, useEffect } from 'react';
import { announcementApi } from '@/services/announcementApi';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/utils/lang';
import './AnnouncementBar.css';

const AnnouncementBar = () => {
  const { t } = useLang();
  const s = t.announcementBar || {};
  const { isAuthenticated, selectedProfile } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [visibleBars, setVisibleBars] = useState([]);
  const [visibleBoxes, setVisibleBoxes] = useState([]);
  const [currentBoxIndex, setCurrentBoxIndex] = useState(0);
  const [currentBarIndex, setCurrentBarIndex] = useState(0);

  // Fetch data từ API đúng 1 lần
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await announcementApi.getActive();
        if (res.data?.success) {
          setAnnouncements(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch announcements", err);
      }
    };
    fetchAnnouncements();
  }, []);

  // Xử lý logic hiển thị lại mỗi khi data hoặc profile thay đổi (không tốn Network request)
  useEffect(() => {
    if (announcements.length > 0) {
      processAnnouncements(announcements);
    }
  }, [announcements, isAuthenticated, selectedProfile]);
  const processAnnouncements = (activeAnns) => {
    const savedData = JSON.parse(localStorage.getItem('gienphim_seen_ids') || '{}');
    const now = new Date().getTime();
    let hasChanges = false;

    // --- GARBAGE COLLECTION (Dọn rác LocalStorage) ---
    Object.keys(savedData).forEach(key => {
      // 1. Xóa các key đã quá hạn TTL (không phải forever)
      if (savedData[key] !== 'forever' && now > savedData[key]) {
        delete savedData[key];
        hasChanges = true;
      }
      
      // 2. Xóa các key của phiên bản cũ (cùng ID nhưng khác updatedAt)
      const idPart = key.split('_')[0];
      const activeAnn = activeAnns.find(a => a.id === idPart);
      if (activeAnn) {
         const activeKey = `${activeAnn.id}_${new Date(activeAnn.updatedAt || 0).getTime()}`;
         if (key !== activeKey) {
            delete savedData[key];
            hasChanges = true;
         }
      }
    });

    if (hasChanges) {
       localStorage.setItem('gienphim_seen_ids', JSON.stringify(savedData));
    }
    // ------------------------------------------------

    // Lọc những thông báo chưa xem hoặc đã hết hạn TTL
    const filterFn = (a) => {
      const cacheKey = `${a.id}_${new Date(a.updatedAt || 0).getTime()}`;
      const seenTime = savedData[cacheKey];
      if (!seenTime) return true;
      if (seenTime === 'forever') return false; // Tắt vĩnh viễn
      return now > seenTime; // Đã quá hạn TTL
    };

    const bars = activeAnns.filter(a => a.display === 'BAR' && filterFn(a));
    const boxes = activeAnns.filter(a => a.display === 'BOX' && filterFn(a));

    if (boxes.length > 0) {
      setVisibleBoxes(boxes);
      setCurrentBoxIndex(0);
    } else if (bars.length > 0) {
      setVisibleBars(bars);
    }
  };

  const markAsSeen = (ann) => {
    const savedData = JSON.parse(localStorage.getItem('gienphim_seen_ids') || '{}');
    const now = new Date().getTime();
    
    const cacheKey = `${ann.id}_${new Date(ann.updatedAt || 0).getTime()}`;

    // Tính toán TTL
    if (isAuthenticated && selectedProfile) {
      if (selectedProfile.notifMutedForever) {
        savedData[cacheKey] = 'forever';
      } else {
        const days = selectedProfile.notifMuteDays || 1;
        savedData[cacheKey] = now + days * 24 * 60 * 60 * 1000;
      }
    } else {
      // Guest: mặc định 1 ngày
      savedData[cacheKey] = now + 1 * 24 * 60 * 60 * 1000;
    }

    localStorage.setItem('gienphim_seen_ids', JSON.stringify(savedData));
  };

  const handleAcknowledge = () => {
    const box = visibleBoxes[currentBoxIndex];
    if (box) markAsSeen(box);
    
    if (currentBoxIndex < visibleBoxes.length - 1) {
      setCurrentBoxIndex(prev => prev + 1);
    } else {
      closeModal();
    }
  };

  const closeModal = () => {
    setVisibleBoxes([]);
    setCurrentBoxIndex(0);
    
    // After all boxes are closed, check if there are bars to show
    const savedData = JSON.parse(localStorage.getItem('gienphim_seen_ids') || '{}');
    const now = new Date().getTime();
    const bars = announcements.filter(a => {
      if (a.display !== 'BAR') return false;
      const cacheKey = `${a.id}_${new Date(a.updatedAt || 0).getTime()}`;
      const seenTime = savedData[cacheKey];
      if (!seenTime) return true;
      if (seenTime === 'forever') return false;
      return now > seenTime;
    });
    
    if (bars.length > 0) setVisibleBars(bars);
  };

  const handleCloseModal = () => {
    // Mark all visible boxes as seen when clicking X
    visibleBoxes.forEach(box => {
      markAsSeen(box);
    });
    closeModal();
  };

  const handleCloseBar = () => {
    const bar = visibleBars[currentBarIndex];
    if (bar) markAsSeen(bar);
    setVisibleBars([]);
  };

  const handleBarIteration = () => {
    const bar = visibleBars[currentBarIndex];
    if (bar) markAsSeen(bar); // Chạy hết 1 vòng cũng coi như đã xem

    if (currentBarIndex < visibleBars.length - 1) {
      setCurrentBarIndex(prev => prev + 1);
    } else {
      setVisibleBars([]);
    }
  };

  const bar = visibleBars[currentBarIndex];
  const box = visibleBoxes[currentBoxIndex];

  useEffect(() => {
    if (bar) {
      document.body.classList.add('has-ann-bar');
    } else {
      document.body.classList.remove('has-ann-bar');
    }
    return () => {
      document.body.classList.remove('has-ann-bar');
    };
  }, [bar]);

  return (
    <>
      {bar && (
        <div className={`ann-bar ann-bar--${bar.type.toLowerCase()}`}>
          <div className="ann-bar__content">
            <div className="ann-bar__marquee" onAnimationIteration={handleBarIteration}>
              <span className="ann-bar__badge">{bar.badge}</span>
              <span className="ann-bar__text">{bar.text}</span>
            </div>
          </div>
          <button className="ann-bar__close" onClick={handleCloseBar}>&times;</button>
        </div>
      )}

      {box && (
        <div className="ann-box-overlay">
          <div className={`ann-box ann-box--${box.type.toLowerCase()}`}>
            {currentBoxIndex > 0 && (
              <button 
                className="ann-box__icon-btn ann-box__back" 
                onClick={() => setCurrentBoxIndex(prev => prev - 1)}
                title={s.back || "Quay lại"}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            <button className="ann-box__icon-btn ann-box__close" onClick={handleCloseModal} title={s.close || "Đóng"}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="ann-box__inner-content" key={box.id}>
              <div className="ann-box__header">
                <span className="ann-box__badge">{box.badge}</span>
                {box.title && <h3 className="ann-box__title">{box.title}</h3>}
              </div>
              <div className="ann-box__body">
                <p className="ann-box__text">{box.text}</p>
              </div>
            </div>
            {visibleBoxes.length > 1 && (
              <div className="ann-box__progress">
                <div className="ann-box__progress-bars">
                  {visibleBoxes.map((_, idx) => {
                    let statusClass = '';
                    if (idx === currentBoxIndex) statusClass = 'active';
                    else if (idx < currentBoxIndex) statusClass = 'completed';
                    
                    return (
                      <div 
                        key={idx} 
                        className={`ann-box__progress-segment ${statusClass}`}
                        onClick={() => setCurrentBoxIndex(idx)}
                      ></div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="ann-box__footer" key={`footer-${box.id}`}>
              {box.link && <a href={box.link} target="_blank" rel="noopener noreferrer" className="ann-box__btn ann-box__btn--primary">{s.watchNow || 'Xem ngay'}</a>}
              <button className="ann-box__btn ann-box__btn--outline" onClick={handleAcknowledge}>
                {visibleBoxes.length > 1 && currentBoxIndex < visibleBoxes.length - 1 ? (s.next || 'Tiếp theo') : (s.gotIt || 'Đã hiểu')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnnouncementBar;
