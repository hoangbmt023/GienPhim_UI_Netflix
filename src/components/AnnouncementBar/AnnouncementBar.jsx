import React, { useState, useEffect } from 'react';
import './AnnouncementBar.css';

const AnnouncementBar = () => {
  const announcements = [
    { 
      id: 'disclaimer-box', 
      displayType: 'box', 
      type: 'danger', 
      badge: 'CẢNH BÁO', 
      text: 'Nguồn phim được lấy từ các API bên thứ ba. GienPhim không chịu trách nhiệm về bất kỳ nội dung nào có trong video.', 
      link: '' 
    },
    { 
      id: 'welcome-bar', 
      displayType: 'bar', 
      type: 'info', 
      badge: 'THÔNG BÁO', 
      text: 'Chào mừng bạn đến với GienPhim! Website đang trong quá trình cập nhật giao diện mới. Chúc bạn xem phim vui vẻ!', 
      link: '' 
    }
  ];

  const [visibleBars, setVisibleBars] = useState([]);
  const [currentBoxIndex, setCurrentBoxIndex] = useState(-1);
  const [currentBarIndex, setCurrentBarIndex] = useState(0);

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('gienphim_seen_ids') || '{}');
    const now = new Date().getTime();

    // Lọc ra những thông báo Bar chưa xem hoặc đã hết hạn 24h
    const bars = announcements.filter(a => {
      if (a.displayType !== 'bar') return false;
      const seenTime = savedData[a.id];
      return !seenTime || now > seenTime + 24 * 60 * 60 * 1000;
    });

    // Tìm Box chưa xem hoặc đã hết hạn 24h
    const boxIndex = announcements.findIndex(a => {
      if (a.displayType !== 'box') return false;
      const seenTime = savedData[a.id];
      return !seenTime || now > seenTime + 24 * 60 * 60 * 1000;
    });

    if (boxIndex !== -1) {
      setCurrentBoxIndex(boxIndex);
    } else if (bars.length > 0) {
      setVisibleBars(bars);
    }
  }, []);

  const markAsSeen = (id) => {
    const savedData = JSON.parse(localStorage.getItem('gienphim_seen_ids') || '{}');
    savedData[id] = new Date().getTime();
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
      if (a.displayType !== 'bar') return false;
      const seenTime = savedData[a.id];
      return !seenTime || now > seenTime + 24 * 60 * 60 * 1000;
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
        <div className={`ann-bar ann-bar--${bar.type}`}>
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
          <div className={`ann-box ann-box--${box.type}`}>
            <button className="ann-box__close" onClick={handleCloseBox}>&times;</button>
            <div className="ann-box__header">
              <span className="ann-box__badge">{box.badge}</span>
            </div>
            <div className="ann-box__body">
              <p className="ann-box__text">{box.text}</p>
            </div>
            <div className="ann-box__footer">
              {box.link && <a href={box.link} className="ann-box__btn ann-box__btn--primary">Xem ngay</a>}
              <button className="ann-box__btn ann-box__btn--outline" onClick={handleCloseBox}>Đã hiểu</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnnouncementBar;
