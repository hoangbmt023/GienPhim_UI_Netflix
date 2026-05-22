import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  getCategories,
  getCountries,
  searchMovies,
  imgUrl,
  parseItems,
} from "@/services/ophimApi";
import { useAuth } from "@/contexts/AuthContext";
import { getPath, useLang } from "@/utils/lang";
import SettingsModal from "@/components/SettingsModal/SettingsModal";
import "./Header.css";

/* ─── ICONS ─── */
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* ─── STATIC DATA ─── */
const STATIC_CATEGORIES = [
  { _id: "1", name: "Hành Động", slug: "hanh-dong" },
  { _id: "2", name: "Tình Cảm", slug: "tinh-cam" },
  { _id: "3", name: "Hài Hước", slug: "hai-huoc" },
  { _id: "4", name: "Cổ Trang", slug: "co-trang" },
  { _id: "5", name: "Tâm Lý", slug: "tam-ly" },
  { _id: "6", name: "Hình Sự", slug: "hinh-su" },
  { _id: "7", name: "Chiến Tranh", slug: "chien-tranh" },
  { _id: "8", name: "Võ Thuật", slug: "vo-thuat" },
  { _id: "9", name: "Viễn Tưởng", slug: "vien-tuong" },
  { _id: "10", name: "Kinh Dị", slug: "kinh-di" },
  { _id: "11", name: "Phiêu Lưu", slug: "phieu-luu" },
  { _id: "12", name: "Gia Đình", slug: "gia-dinh" },
  { _id: "13", name: "Thần Thoại", slug: "than-thoai" },
  { _id: "14", name: "Khoa Học", slug: "khoa-hoc" },
  { _id: "15", name: "Tài Liệu", slug: "tai-lieu" },
  { _id: "16", name: "Học Đường", slug: "hoc-duong" },
  { _id: "17", name: "Bí Ẩn", slug: "bi-an" },
  { _id: "18", name: "Chính kịch", slug: "chinh-kich" },
  { _id: "19", name: "Phìm 18+", slug: "phim-18" },
  { _id: "20", name: "Short Drama", slug: "short-drama" },
];

const STATIC_COUNTRIES = [
  { _id: "c1", name: "Hàn Quốc", slug: "han-quoc" },
  { _id: "c2", name: "Trung Quốc", slug: "trung-quoc" },
  { _id: "c3", name: "Nhật Bản", slug: "nhat-ban" },
  { _id: "c4", name: "Âu Mỹ", slug: "au-my" },
  { _id: "c5", name: "Việt Nam", slug: "viet-nam" },
  { _id: "c6", name: "Thái Lan", slug: "thai-lan" },
  { _id: "c7", name: "Đài Loan", slug: "dai-loan" },
  { _id: "c8", name: "Hồng Kông", slug: "hong-kong" },
  { _id: "c9", name: "Ấn Độ", slug: "an-do" },
  { _id: "c10", name: "Anh", slug: "anh" },
  { _id: "c11", name: "Pháp", slug: "phap" },
  { _id: "c12", name: "Canada", slug: "canada" },
  { _id: "c13", name: "Đức", slug: "duc" },
  { _id: "c14", name: "Tây Ban Nha", slug: "tay-ban-nha" },
  { _id: "c15", name: "Thổ Nhĩ Kỳ", slug: "tho-nhi-ky" },
  { _id: "c16", name: "Indonesia", slug: "indonesia" },
  { _id: "c17", name: "Nga", slug: "nga" },
  { _id: "c18", name: "Úc", slug: "uc" },
  { _id: "c19", name: "Malaysia", slug: "malaysia" },
  { _id: "c20", name: "Philippines", slug: "philippines" },
];

/* ─── SEARCH DROPDOWN ─── */
function SearchDropdown({ keyword, results, loading, onClose, t }) {
  if (!keyword.trim()) return null;
  return (
    <div className="search__dropdown" role="listbox">
      {loading ? (
        <p className="search__loading">{t.header.searching}</p>
      ) : results.length === 0 ? (
        <p className="search__no-result">{t.header.noResult}</p>
      ) : (
        <>
          <p className="search__dropdown-header">{t.header.searchResults}</p>
          {results.slice(0, 6).map((m) => (
            <Link key={m._id} to={`${getPath('movie')}/${m.slug}`} className="search__result-item" onClick={onClose}>
              <img className="search__result-thumb" src={imgUrl(m.thumb_url)} alt={m.name}
                onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
              <div className="search__result-info">
                <p className="search__result-name">{m.name}</p>
                <p className="search__result-meta">{m.origin_name} · {m.year}</p>
              </div>
              {m.quality && <span className="search__result-quality">{m.quality}</span>}
            </Link>
          ))}
          <div className="search__dropdown-footer">
            <Link to={`${getPath('search')}?keyword=${encodeURIComponent(keyword)}`} onClick={onClose}>
              {t.header.viewAll}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function Header() {
  const location = useLocation();
  const { t, lang } = useLang();

  const STATIC_LEFT = [
    { label: t.header.home, to: getPath('home') },
    { label: t.header.movies, to: getPath('movies') },
    { label: t.header.series, to: getPath('series') },
    { label: t.header.animation, to: getPath('animation') },
  ];

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDrawerItem, setOpenDrawerItem] = useState(null);
  const [openNav, setOpenNav] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState(STATIC_CATEGORIES);
  const [countries, setCountries] = useState(STATIC_COUNTRIES);
  const [profileOpen, setProfileOpen] = useState(false);
  const [drawerProfileOpen, setDrawerProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { isAuthenticated, selectedProfile, logout, user } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const navRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    getCategories()
      .then((r) => { const items = r?.data?.items || r?.items || []; if (items.length > 0) setCategories(items); })
      .catch(() => { });
    getCountries()
      .then((r) => { const items = r?.data?.items || r?.items || []; if (items.length > 0) setCountries(items); })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1150) { setMobileOpen(false); setOpenDrawerItem(null); }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const handler = (e) => {
      const inDesktop = searchRef.current?.contains(e.target);
      const inMobile = mobileSearchRef.current?.contains(e.target);
      if (!inDesktop && !inMobile) setShowDropdown(false);
      if (navRef.current && !navRef.current.contains(e.target)) setOpenNav(null);
      const profileEl = document.getElementById("header-profile");
      if (profileEl && !profileEl.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setShowDropdown(false); setSearchResults([]); return; }
    setShowDropdown(true);
    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try { const r = await searchMovies(val.trim(), 1); setSearchResults(parseItems(r)); }
      catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 380);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    navigate(`${getPath('search')}?keyword=${encodeURIComponent(searchValue.trim())}`);
    setSearchValue(""); setShowDropdown(false); setMobileOpen(false);
  };

  const closeAll = () => { setShowDropdown(false); setSearchValue(""); setMobileOpen(false); setProfileOpen(false); };

  const categoryGrid = categories.slice(0, 20);
  const countryGrid = countries.slice(0, 20);

  const avatarSrc = selectedProfile?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedProfile?.id || 'default'}`;

  return (
    <>
      {/* ── DESKTOP HEADER ── */}
      <header className={`header ${scrolled ? "scrolled" : ""}`}>
        <div className="header__inner">

          {/* LOGO */}
          <Link to={getPath('home')} className="header__logo" onClick={closeAll}>
            <span className="header__logo-text">GIENPHIM</span>
          </Link>

          {/* SEARCH */}
          <div className="header__search" ref={searchRef}>
            <span className="header__search-icon"><SearchIcon /></span>
            <form onSubmit={handleSearchSubmit} role="search">
              <input
                id="header-search-input"
                className="header__search-input"
                type="search"
                placeholder={t.header.searchPlaceholder}
                value={searchValue}
                onChange={handleSearchChange}
                onFocus={() => searchValue.trim() && setShowDropdown(true)}
                autoComplete="off"
              />
            </form>
            {showDropdown && (
              <SearchDropdown keyword={searchValue} results={searchResults} loading={searchLoading} onClose={closeAll} t={t} />
            )}
          </div>

          {/* NAV */}
          <nav className="header__nav" ref={navRef}>
            {STATIC_LEFT.map((item) => (
              <div key={item.label} className="nav__item">
                <NavLink to={item.to} className={({ isActive }) => `nav__link${isActive ? " active" : ""}`}>
                  {item.label}
                </NavLink>
              </div>
            ))}

            {/* Thể loại */}
            <div className={`nav__item ${openNav === "genre" ? "open" : ""}`} style={{ position: "relative" }}>
              <span className={`nav__link${openNav === "genre" ? " active" : ""}`}
                onClick={() => setOpenNav((p) => (p === "genre" ? null : "genre"))}
                role="button" tabIndex={0} style={{ cursor: "pointer", userSelect: "none" }}>
                {t.header.genres} <ChevronIcon />
              </span>
              {openNav === "genre" && (
                <div className="nav__dropdown nav__dropdown--grid" style={{ display: "grid" }}>
                  {categoryGrid.map((c) => (
                    <Link key={c._id} to={`${getPath('category')}/${c.slug}`} className="dropdown__link" onClick={() => setOpenNav(null)}>
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quốc gia */}
            <div className={`nav__item ${openNav === "country" ? "open" : ""}`} style={{ position: "relative" }}>
              <span className={`nav__link${openNav === "country" ? " active" : ""}`}
                onClick={() => setOpenNav((p) => (p === "country" ? null : "country"))}
                role="button" tabIndex={0} style={{ cursor: "pointer", userSelect: "none" }}>
                {t.header.countries} <ChevronIcon />
              </span>
              {openNav === "country" && (
                <div className="nav__dropdown nav__dropdown--grid nav__dropdown--wide" style={{ display: "grid" }}>
                  {countryGrid.map((c) => (
                    <Link key={c._id} to={`${getPath('country')}/${c.slug}`} className="dropdown__link" onClick={() => setOpenNav(null)}>
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Phim Việt Nam */}
            <div className="nav__item">
              <NavLink to={getPath('countryVietnam')} className={({ isActive }) => `nav__link${isActive ? " active" : ""}`}>
                {t.header.vietnamese}
              </NavLink>
            </div>
          </nav>

          {/* RIGHT */}
          <div className="header__right">
            {isAuthenticated ? (
              <div id="header-profile" className="header__profile">
                <div className="header__avatar" onClick={() => setProfileOpen(!profileOpen)}>
                  <img src={avatarSrc} alt="Avatar" />
                  <span className={`profile__caret ${profileOpen ? 'open' : ''}`}><ChevronIcon /></span>
                </div>
                {profileOpen && (
                  <div className="profile__dropdown">
                    <div className="profile__dropdown-header">
                      <img src={avatarSrc} alt="Avatar" />
                      <div className="profile__info">
                        <strong>{selectedProfile?.name || 'User'}</strong>
                        <span>{t.header.currentProfile}</span>
                      </div>
                    </div>
                    <div className="profile__dropdown-divider" />
                    <div
                      className="profile__dropdown-item"
                      onClick={() => { setProfileOpen(false); setSettingsOpen(true); }}
                      style={{ cursor: 'pointer' }}
                    >
                      {t.header.settings || 'Cài đặt'}
                    </div>
                    <div className="profile__dropdown-divider" />
                    <Link to={getPath('profiles')} className="profile__dropdown-item" onClick={() => setProfileOpen(false)}>
                      {t.header.changeProfile}
                    </Link>
                    <Link to={`${getPath('myList')}?tab=history`} className="profile__dropdown-item" onClick={() => setProfileOpen(false)}>
                      {t.header.watchHistory}
                    </Link>
                    <Link to={`${getPath('myList')}?tab=saved`} className="profile__dropdown-item" onClick={() => setProfileOpen(false)}>
                      {t.header.savedMovies}
                    </Link>
                    <Link to={getPath('myTickets')} className="profile__dropdown-item" onClick={() => setProfileOpen(false)}>
                      {t.header.supportHistory}
                    </Link>
                    {user && ['MODERATOR', 'ADMIN'].includes(user.role) && (
                      <>
                        <div className="profile__dropdown-divider" />
                        <Link to={getPath('moderator')} className="profile__dropdown-item profile__dropdown-item--mod" onClick={() => setProfileOpen(false)}>
                          {t.header.moderatorPanel}
                        </Link>
                      </>
                    )}
                    <div className="profile__dropdown-divider" />
                    <button className="profile__dropdown-item text-danger" onClick={() => { logout(); setProfileOpen(false); }}>
                      {t.header.signOut}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to={getPath('login')} className="header__login-btn header__login-btn--desktop">
                {t.header.signIn}
              </Link>
            )}

            <button
              className={`header__hamburger ${mobileOpen ? "open" : ""}`}
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? t.header.closeMenu : t.header.openMenu}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE DRAWER ── */}
      <div className={`header__drawer ${mobileOpen ? "open" : ""}`} role="navigation">

        {isAuthenticated ? (
          <div className="drawer__profile-block">
            <div
              className={`drawer__profile ${drawerProfileOpen ? 'open' : ''}`}
              onClick={() => setDrawerProfileOpen(p => !p)}
              role="button"
            >
              <img src={avatarSrc} alt="Avatar" className="drawer__profile-avatar" />
              <div className="drawer__profile-info">
                <strong>{selectedProfile?.name || 'User'}</strong>
                <span>{t.header.currentProfile}</span>
              </div>
              <span className={`drawer__profile-chevron ${drawerProfileOpen ? 'open' : ''}`}>
                <ChevronIcon />
              </span>
            </div>

            {drawerProfileOpen && (
              <div className="drawer__profile-panel">
                  <div
                    className="drawer__account-link"
                    onClick={() => { setDrawerProfileOpen(false); setMobileOpen(false); setSettingsOpen(true); }}
                    style={{ cursor: 'pointer' }}
                  >
                    {t.header.settings || 'Cài đặt'}
                  </div>
                <div className="profile__dropdown-divider" style={{ margin: '4px 0', opacity: 0.5 }} />
                <Link to={getPath('profiles')} className="drawer__account-link" onClick={() => setMobileOpen(false)}>
                  {t.header.changeProfile}
                </Link>
                <Link to={`${getPath('myList')}?tab=history`} className="drawer__account-link" onClick={() => setMobileOpen(false)}>
                  {t.header.watchHistory}
                </Link>
                <Link to={`${getPath('myList')}?tab=saved`} className="drawer__account-link" onClick={() => setMobileOpen(false)}>
                  {t.header.savedMovies}
                </Link>
                <Link to={getPath('myTickets')} className="drawer__account-link" onClick={() => setMobileOpen(false)}>
                  {t.header.supportHistory}
                </Link>
                {user && ['MODERATOR', 'ADMIN'].includes(user.role) && (
                  <Link to={getPath('moderator')} className="drawer__account-link drawer__account-link--mod" onClick={() => setMobileOpen(false)}>
                    {t.header.moderatorPanel}
                  </Link>
                )}
                <button className="drawer__account-link drawer__signout" onClick={() => { logout(); setMobileOpen(false); }}>
                  {t.header.signOut}
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to={getPath('login')} className="drawer__login-btn" onClick={() => setMobileOpen(false)}>
            {t.header.signIn}
          </Link>
        )}

        <div className="drawer__divider" />

        <div ref={mobileSearchRef} className="drawer__search-wrapper">
          <form className="drawer__search" onSubmit={handleSearchSubmit}>
            <span className="drawer__search-icon"><SearchIcon /></span>
            <input
              type="search"
              placeholder={t.header.searchPlaceholder}
              value={searchValue}
              onChange={handleSearchChange}
              onFocus={() => searchValue.trim() && setShowDropdown(true)}
              autoComplete="off"
            />
          </form>
          {showDropdown && (
            <SearchDropdown keyword={searchValue} results={searchResults} loading={searchLoading} onClose={closeAll} t={t} />
          )}
        </div>

        <div className="drawer__divider" />

        {STATIC_LEFT.map((item) => (
          <NavLink key={item.label} to={item.to}
            className={({ isActive }) => `drawer__link${isActive ? " active" : ""}`}
            onClick={() => setMobileOpen(false)}>
            {item.label}
          </NavLink>
        ))}

        <button className={`drawer__link ${openDrawerItem === "genre" ? "expanded" : ""}`}
          onClick={() => setOpenDrawerItem((p) => (p === "genre" ? null : "genre"))}>
          {t.header.genres} <ChevronIcon />
        </button>
        <div className={`drawer__sub ${openDrawerItem === "genre" ? "open" : ""}`}>
          {categoryGrid.map((c) => (
            <Link key={c._id} to={`${getPath('category')}/${c.slug}`} className="drawer__sub-link" onClick={() => setMobileOpen(false)}>
              {c.name}
            </Link>
          ))}
        </div>

        <button className={`drawer__link ${openDrawerItem === "country" ? "expanded" : ""}`}
          onClick={() => setOpenDrawerItem((p) => (p === "country" ? null : "country"))}>
          {t.header.countries} <ChevronIcon />
        </button>
        <div className={`drawer__sub ${openDrawerItem === "country" ? "open" : ""}`}>
          {countryGrid.map((c) => (
            <Link key={c._id} to={`${getPath('country')}/${c.slug}`} className="drawer__sub-link" onClick={() => setMobileOpen(false)}>
              {c.name}
            </Link>
          ))}
        </div>

        <NavLink to={getPath('countryVietnam')}
          className={({ isActive }) => `drawer__link${isActive ? " active" : ""}`}
          onClick={() => setMobileOpen(false)}>
          {t.header.vietnamese}
        </NavLink>
      </div>

      {/* ── SETTINGS MODAL ── */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        lang={lang}
      />
    </>
  );
}
