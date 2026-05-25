import React, { useState, useEffect } from 'react';
import { announcementApi } from '@/services/announcementApi';
import { useAuth } from '@/contexts/AuthContext';
import './AnnouncementBar.css';

const AnnouncementBar = () => {
  const { isAuthenticated, selectedProfile } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [visibleBars, setVisibleBars] = useState([]);
  const [currentBoxIndex, setCurrentBoxIndex] = useState(-1);
  const [currentBarIndex, setCurrentBarIndex] = useState(0);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await announcementApi.getActive();
        if (res.data?.success) {
          const activeAnns = res.data.data;
          setAnnouncements(activeAnns);
          processAnnouncements(activeAnns);
        }
      } catch (err) {
        console.error("Failed to fetch announcements", err);
      }
    };
    fetchAnnouncements();
  }, [isAuthenticated, selectedProfile]); // Re-run if profile changes (which changes TTL)

  const processAnnouncements = (activeAnns) => {
    const savedData = JSON.parse(localStorage.getItem('gienphim_seen_ids') || '{}');
    const now = new Date().getTime();

    // Lọc những thông báo chưa xem hoặc đã hết hạn TTL
    const filterFn = (a) => {
      const seenTime = savedData[a.id];
      if (!seenTime) return true;
      if (seenTime === 'forever') return false; // Tắt vĩnh viễn
      return now > seenTime; // Đã quá hạn TTL
    };

    const bars = activeAnns.filter(a => a.display === 'BAR' && filterFn(a));
    const boxIndex = activeAnns.findIndex(a => a.display === 'BOX' && filterFn(a));

    if (boxIndex !== -1) {
      setCurrentBoxIndex(boxIndex);
    } else if (bars.length > 0) {
      setVisibleBars(bars);
    }
  };

  const markAsSeen = (id) => {
    const savedData = JSON.parse(localStorage.getItem('gienphim_seen_ids') || '{}');
    const now = new Date().getTime();
    
    // Tính toán TTL
    if (isAuthenticated && selectedProfile) {
      if (selectedProfile.notifMutedForever) {
        savedData[id] = 'forever';
      } else {
        const days = selectedProfile.notifMuteDays || 1;
        savedData[id] = now + days * 24 * 60 * 60 * 1000;
      }
    } else {
      // Guest: mặc định 1 ngày
      savedData[id] = now + 1 * 24 * 60 * 60 * 1000;
    }

    localStorage.setItem('gienphim_seen_ids', JSON.stringify(savedData));
  };

  const handleCloseBox = () => {
    const box = announcements[currentBoxIndex];
    if (box) markAsSeen(box.id);
    
    setCurrentBoxIndex(-1);
    
    // Sau khi đóng Box, kiểm tra xem có Bar nào cần hiện không
    const savedData = JSON.parse(localStorage.getItem('gienphim_seen_ids') || '{}');
    const now = new Date().getTime();
    const bars = announcements.filter(a => {
      if (a.display !== 'BAR') return false;
      const seenTime = savedData[a.id];
      if (!seenTime) return true;
      if (seenTime === 'forever') return false;
      return now > seenTime;
    });
    
    if (bars.length > 0) setVisibleBars(bars);
  };

  const handleCloseBar = () => {
    const bar = visibleBars[currentBarIndex];
    if (bar) markAsSeen(bar.id);
    setVisibleBars([]);
  };

  const handleBarIteration = () => {
    const bar = visibleBars[currentBarIndex];
    if (bar) markAsSeen(bar.id); // Chạy hết 1 vòng cũng coi như đã xem

    if (currentBarIndex < visibleBars.length - 1) {
      setCurrentBarIndex(prev => prev + 1);
    } else {
      setVisibleBars([]);
    }
  };

  const bar = visibleBars[currentBarIndex];
  const box = currentBoxIndex !== -1 ? announcements[currentBoxIndex] : null;

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
            <button className="ann-box__close" onClick={handleCloseBox}>&times;</button>
            <div className="ann-box__header">
              <span className="ann-box__badge">{box.badge}</span>
            </div>
            <div className="ann-box__body">
              <p className="ann-box__text">{box.text}</p>
            </div>
            <div className="ann-box__footer">
              {box.link && <a href={box.link} target="_blank" rel="noopener noreferrer" className="ann-box__btn ann-box__btn--primary">Xem ngay</a>}
              <button className="ann-box__btn ann-box__btn--outline" onClick={handleCloseBox}>Đã hiểu</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnnouncementBar;
