import { Link } from 'react-router-dom';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="nf-content">
        <h1 className="nf-title">404</h1>
        <h2 className="nf-subtitle">Lạc Đường Rồi Bạn Ơi!</h2>
        <p className="nf-desc">
          Có vẻ như bạn đã nhập sai đường dẫn hoặc trang phim này không còn tồn tại trên hệ thống GienPhim.
          Đừng lo, vẫn còn hàng ngàn bộ phim hấp dẫn khác đang chờ bạn khám phá!
        </p>
        <div className="nf-actions">
          <Link to="/home" className="nf-btn nf-btn--primary">
            Trở Về Trang Chủ
          </Link>
        </div>
      </div>
    </div>
  );
}