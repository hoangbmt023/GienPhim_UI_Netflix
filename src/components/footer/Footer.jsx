import { Link } from "react-router-dom";
import "./Footer.css";

/* ─── INLINE SVG ICONS ─── */
const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#141414" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const GmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const GlobeIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

/* ─── FOOTER DATA ─── */
const LINKS = [
  {
    title: "GienPhim",
    items: [
      { label: "Giới thiệu", to: "/gioi-thieu" },
      { label: "Liên hệ", to: "/lien-he" },
    ],
  },
  {
    title: "Nội dung",
    items: [
      { label: "Phim Lẻ", to: "/phim-le" },
      { label: "Phim Bộ", to: "/phim-bo" },
      { label: "Phim Hoạt Hình", to: "/hoat-hinh" },
      { label: "Phim Việt Nam", to: "/quoc-gia/viet-nam" },
    ],
  },
  {
    title: "Thể loại",
    items: [
      { label: "Hành Động", to: "/the-loai/hanh-dong" },
      { label: "Tình Cảm", to: "/the-loai/tinh-cam" },
      { label: "Kinh Dị", to: "/the-loai/kinh-di" },
      { label: "Hài Hước", to: "/the-loai/hai-huoc" },
    ],
  },
  {
    title: "Hỗ trợ",
    items: [
      { label: "Câu hỏi thường gặp", to: "/cau-hoi-thuong-gap" },
      { label: "Báo lỗi phim", to: "/lien-he" },
      { label: "Chính sách bảo mật", to: "/chinh-sach-bao-mat" },
      { label: "Điều khoản sử dụng", to: "/dieu-khoan-su-dung" },
    ],
  },
];

const SOCIALS = [
  { href: "https://www.facebook.com/profile.php?id=61587108330332", label: "Facebook", icon: <FacebookIcon /> },
  { href: "https://www.instagram.com/gienphimmanager/", label: "Instagram", icon: <InstagramIcon /> },
  { href: "mailto:gienphimmanager@gmail.com", label: "Gmail", icon: <GmailIcon /> },
  { href: "https://www.youtube.com/@Gien-Phim", label: "YouTube", icon: <YoutubeIcon /> },
];

/* ─── COMPONENT ─── */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* TOP ROW */}
        <div className="footer__top">
          <Link
            to="/home"
            className="footer__logo"
            aria-label="GienPhim – Trang chủ"
          >
            <img
              src="/logo_vuong.png"
              alt="GienPhim Logo"
              className="footer__logo-img"
            />
            <span className="footer__logo-text">GIENPHIM</span>
          </Link>

          <div className="footer__socials" aria-label="Mạng xã hội">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="social__btn"
                aria-label={s.label}
                title={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* LINK COLUMNS */}
        <div className="footer__links">
          {LINKS.map((col) => (
            <div key={col.title} className="footer__col">
              <h3 className="footer__col-title">{col.title}</h3>
              <ul>
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* BOTTOM ROW */}
        <div className="footer__bottom">
          <div className="footer__bottom-links">
            <Link to="/cau-hoi-thuong-gap">Câu hỏi thường gặp</Link>
            <Link to="/chinh-sach-bao-mat">Chính sách bảo mật</Link>
            <Link to="/dieu-khoan-su-dung">Điều khoản sử dụng</Link>
            <Link to="/lien-he">Liên hệ</Link>
          </div>

          <div className="footer__lang-wrap">
            <span className="footer__lang-icon">🌐</span>
            <select className="footer__lang-select" aria-label="Chọn ngôn ngữ">
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>

          <p className="footer__copyright">
            © {year} GiênPhim. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
