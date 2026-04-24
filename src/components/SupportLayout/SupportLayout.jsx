import { NavLink, Outlet } from 'react-router-dom';
import './SupportLayout.css';

const SUPPORT_LINKS = [
  { to: '/gioi-thieu', label: 'Giới Thiệu GienPhim' },
  { to: '/cau-hoi-thuong-gap', label: 'Câu Hỏi Thường Gặp' },
  { to: '/chinh-sach-bao-mat', label: 'Chính Sách Bảo Mật' },
  { to: '/dieu-khoan-su-dung', label: 'Điều Khoản Sử Dụng' },
  { to: '/lien-he', label: 'Liên Hệ & Báo Lỗi' },
];

export default function SupportLayout() {
  return (
    <div className="support-layout">
      <div className="support-container">
        {/* SIDEBAR */}
        <aside className="support-sidebar">
          <h2 className="support-sidebar-title">Hỗ Trợ & Chính Sách</h2>
          <nav className="support-nav">
            {SUPPORT_LINKS.map(link => (
              <NavLink 
                key={link.to} 
                to={link.to} 
                className={({ isActive }) => `support-nav-link ${isActive ? 'active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* CONTENT */}
        <main className="support-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
