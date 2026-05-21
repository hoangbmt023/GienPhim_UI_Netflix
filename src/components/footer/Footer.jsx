import { Link, useLocation } from "react-router-dom";
import { getLang, setLang, getPath, getSwitchPath, getT } from "@/utils/lang";
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
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="var(--bg-dark)" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const GmailIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const SOCIALS = [
  {
    href: "https://www.facebook.com/profile.php?id=61587108330332",
    label: "Facebook",
    icon: <FacebookIcon />,
  },
  {
    href: "https://www.instagram.com/gienphimmanager/",
    label: "Instagram",
    icon: <InstagramIcon />,
  },
  {
    href: "https://mail.google.com/mail/u/0/?view=cm&fs=1&to=gienphimmanager@gmail.com",
    label: "Gmail",
    icon: <GmailIcon />,
  },
  {
    href: "https://www.youtube.com/@Gien-Phim",
    label: "YouTube",
    icon: <YoutubeIcon />,
  },
];

/* ─── COMPONENT ─── */
export default function Footer() {
  const t = getT();
  const location = useLocation();
  const year = new Date().getFullYear();

  const handleLangChange = (e) => {
    const newLang = e.target.value;
    const nextPath = getSwitchPath(location.pathname, newLang) + location.search;
    setLang(newLang);
    window.location.href = nextPath;
  };

  const LINKS = [
    {
      title: t.footer.colGienPhim,
      items: [
        { label: t.footer.aboutUs, to: getPath("about") },
        { label: t.footer.contact, to: getPath("contact") },
      ],
    },
    {
      title: t.footer.colContent,
      items: [
        { label: t.footer.movies, to: getPath("movies") },
        { label: t.footer.series, to: getPath("series") },
        { label: t.footer.animation, to: getPath("animation") },
        { label: t.footer.vietnamese, to: getPath("countryVietnam") },
      ],
    },
    {
      title: t.footer.colGenres,
      items: [
        { label: t.footer.action, to: `${getPath("category")}/hanh-dong` },
        { label: t.footer.romance, to: `${getPath("category")}/tinh-cam` },
        { label: t.footer.horror, to: `${getPath("category")}/kinh-di` },
        { label: t.footer.comedy, to: `${getPath("category")}/hai-huoc` },
      ],
    },
    {
      title: t.footer.colSupport,
      items: [
        { label: t.footer.faq, to: getPath("faq") },
        { label: t.footer.reportError, to: getPath("contact") },
        { label: t.footer.privacy, to: getPath("privacy") },
        { label: t.footer.terms, to: getPath("terms") },
      ],
    },
  ];

  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* TOP ROW */}
        <div className="footer__top">
          <Link
            to={getPath("home")}
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
            <Link to={getPath("faq")}>{t.footer.faq}</Link>
            <Link to={getPath("privacy")}>{t.footer.privacy}</Link>
            <Link to={getPath("terms")}>{t.footer.terms}</Link>
            <Link to={getPath("contact")}>{t.footer.contact}</Link>
          </div>

          <div className="footer__lang-wrap">
            <span className="footer__lang-icon">🌐</span>
            <select
              className="footer__lang-select"
              aria-label="Chọn ngôn ngữ"
              value={getLang()}
              onChange={handleLangChange}
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>

          <p className="footer__copyright">
            {t.footer.copyright(year)}{" "}
            {import.meta.env.VITE_APP_VERSION &&
              `(v${import.meta.env.VITE_APP_VERSION})`}
          </p>
        </div>
      </div>
    </footer>
  );
}
