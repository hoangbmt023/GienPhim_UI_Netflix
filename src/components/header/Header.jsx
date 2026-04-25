import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  getCategories,
  getCountries,
  searchMovies,
  imgUrl,
  parseItems,
} from "@/services/ophimApi";
import "./Header.css";

/* ─── ICONS ───────────────────────────────────────── */
const SearchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="16"
    height="16"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ChevronIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* ─── STATIC NAV ──────────────────────────────────── */
const STATIC_LEFT = [
  { label: "Home", to: "/home" },
  { label: "Phim Lẻ", to: "/phim-le" },
  { label: "Phim Bộ", to: "/phim-bo" },
  { label: "Phim Hoạt Hình", to: "/hoat-hinh" },
];

/* ─── STATIC FALLBACK (luôn có data dù API fail) ── */
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

/* ─── SEARCH DROPDOWN ─────────────────────────────── */
function SearchDropdown({ keyword, results, loading, onClose }) {
  if (!keyword.trim()) return null;

  return (
    <div
      className="search__dropdown"
      role="listbox"
      aria-label="Kết quả tìm kiếm"
    >
      {loading ? (
        <p className="search__loading">Đang tìm kiếm…</p>
      ) : results.length === 0 ? (
        <p className="search__no-result">Không tìm thấy phim phù hợp</p>
      ) : (
        <>
          <p className="search__dropdown-header">Kết quả tìm kiếm</p>
          {results.slice(0, 6).map((m) => (
            <Link
              key={m._id}
              to={`/phim/${m.slug}`}
              className="search__result-item"
              onClick={onClose}
            >
              <img
                className="search__result-thumb"
                src={imgUrl(m.thumb_url)}
                alt={m.name}
                onError={(e) => {
                  e.currentTarget.style.visibility = "hidden";
                }}
              />
              <div className="search__result-info">
                <p className="search__result-name">{m.name}</p>
                <p className="search__result-meta">
                  {m.origin_name} · {m.year}
                </p>
              </div>
              {m.quality && (
                <span className="search__result-quality">{m.quality}</span>
              )}
            </Link>
          ))}
          <div className="search__dropdown-footer">
            <Link
              to={`/tim-kiem?keyword=${encodeURIComponent(keyword)}`}
              onClick={onClose}
            >
              Xem tất cả kết quả →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── COMPONENT ─────────────────────────────────────── */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDrawerItem, setOpenDrawerItem] = useState(null);
  const [openNav, setOpenNav] = useState(null); // 'genre' | 'country' | null
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  /* State – dùng static data làm initial value */
  const [categories, setCategories] = useState(STATIC_CATEGORIES);
  const [countries, setCountries] = useState(STATIC_COUNTRIES);

  const navigate = useNavigate();
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const navRef = useRef(null);
  const debounceRef = useRef(null);

  /* Fetch categories + countries từ API; fallback to static if fail */
  useEffect(() => {
    getCategories()
      .then((r) => {
        const items = parseItems(r);
        if (items.length > 0) setCategories(items);
      })
      .catch((err) => console.warn("[Header] getCategories failed:", err));

    getCountries()
      .then((r) => {
        const items = parseItems(r);
        if (items.length > 0) setCountries(items);
      })
      .catch((err) => console.warn("[Header] getCountries failed:", err));
  }, []);

  /* Scroll effect */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close mobile on resize */
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
        setOpenDrawerItem(null);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* Lock body */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  /* Click outside → close search dropdown + nav dropdown */
  useEffect(() => {
    const handler = (e) => {
      const inDesktop = searchRef.current && searchRef.current.contains(e.target);
      const inMobile = mobileSearchRef.current && mobileSearchRef.current.contains(e.target);
      if (!inDesktop && !inMobile) {
        setShowDropdown(false);
      }
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenNav(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Debounced live search */
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);

    clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setShowDropdown(false);
      setSearchResults([]);
      return;
    }

    setShowDropdown(true);
    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await searchMovies(val.trim(), 1);
        setSearchResults(parseItems(r));
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 380);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    navigate(`/tim-kiem?keyword=${encodeURIComponent(searchValue.trim())}`);
    setSearchValue("");
    setShowDropdown(false);
    setMobileOpen(false);
  };

  const closeDropdown = () => {
    setShowDropdown(false);
    setSearchValue("");
    setMobileOpen(false);
  };

  const categoryGrid = categories.slice(0, 20);
  const countryGrid = countries.slice(0, 20);

  return (
    <>
      {/* ── DESKTOP HEADER ───────────────────────── */}
      <header className={`header ${scrolled ? "scrolled" : ""}`}>
        <div className="header__inner">
          {/* LOGO */}
          <Link to="/home" className="header__logo" aria-label="GienPhim" onClick={closeDropdown}>
            <span className="header__logo-text">GIENPHIM</span>
          </Link>

          {/* SEARCH with live dropdown */}
          <div className="header__search" ref={searchRef}>
            <span className="header__search-icon" aria-hidden="true">
              <SearchIcon />
            </span>
            <form onSubmit={handleSearchSubmit} role="search">
              <input
                id="header-search-input"
                className="header__search-input"
                type="search"
                placeholder="Tìm kiếm phim, diễn viên..."
                value={searchValue}
                onChange={handleSearchChange}
                onFocus={() => searchValue.trim() && setShowDropdown(true)}
                autoComplete="off"
                aria-label="Tìm kiếm phim"
              />
            </form>
            {showDropdown && (
              <SearchDropdown
                keyword={searchValue}
                results={searchResults}
                loading={searchLoading}
                onClose={closeDropdown}
              />
            )}
          </div>

          {/* NAV */}
          <nav
            className="header__nav"
            aria-label="Navigation chính"
            ref={navRef}
          >
            {STATIC_LEFT.map((item) => (
              <div key={item.label} className="nav__item">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `nav__link${isActive ? " active" : ""}`
                  }
                >
                  {item.label}
                </NavLink>
              </div>
            ))}

            {/* The Loai – click-only dropdown */}
            <div className="nav__item" style={{ position: "relative" }}>
              <span
                className={`nav__link${openNav === "genre" ? " active" : ""}`}
                onClick={() =>
                  setOpenNav((p) => (p === "genre" ? null : "genre"))
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  setOpenNav((p) => (p === "genre" ? null : "genre"))
                }
                style={{ cursor: "pointer", userSelect: "none" }}
              >
                Thể loại <ChevronIcon />
              </span>

              {openNav === "genre" && (
                <div
                  className="nav__dropdown nav__dropdown--grid"
                  style={{ display: "grid" }}
                >
                  {categoryGrid.map((c) => (
                    <Link
                      key={c._id}
                      to={`/the-loai/${c.slug}`}
                      className="dropdown__link"
                      onClick={() => setOpenNav(null)}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quoc Gia – click-only dropdown */}
            <div className="nav__item" style={{ position: "relative" }}>
              <span
                className={`nav__link${openNav === "country" ? " active" : ""}`}
                onClick={() =>
                  setOpenNav((p) => (p === "country" ? null : "country"))
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  setOpenNav((p) => (p === "country" ? null : "country"))
                }
                style={{ cursor: "pointer", userSelect: "none" }}
              >
                Quốc gia <ChevronIcon />
              </span>

              {openNav === "country" && (
                <div
                  className="nav__dropdown nav__dropdown--grid nav__dropdown--wide"
                  style={{ display: "grid" }}
                >
                  {countryGrid.map((c) => (
                    <Link
                      key={c._id}
                      to={`/quoc-gia/${c.slug}`}
                      className="dropdown__link"
                      onClick={() => setOpenNav(null)}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Phim Việt Nam */}
            <div className="nav__item">
              <NavLink
                to="/quoc-gia/viet-nam"
                className={({ isActive }) =>
                  `nav__link${isActive ? " active" : ""}`
                }
              >
                Phim Việt Nam
              </NavLink>
            </div>
          </nav>

          {/* HAMBURGER */}
          <div className="header__right">
            <button
              id="header-hamburger-btn"
              className={`header__hamburger ${mobileOpen ? "open" : ""}`}
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-drawer"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE DRAWER ───────────────────────── */}
      <div
        id="mobile-drawer"
        className={`header__drawer ${mobileOpen ? "open" : ""}`}
        aria-hidden={!mobileOpen}
        role="navigation"
      >
        {/* Search mobile */}
        <div
          ref={mobileSearchRef}
          className="drawer__search-wrapper"
          style={{ position: "relative", width: "100%" }}
        >
          <form
            className="drawer__search"
            onSubmit={handleSearchSubmit}
            role="search"
          >
            <span className="drawer__search-icon">
              <SearchIcon />
            </span>
            <input
              type="search"
              placeholder="Tìm kiếm phim, diễn viên..."
              value={searchValue}
              onChange={handleSearchChange}
              onFocus={() => searchValue.trim() && setShowDropdown(true)}
              autoComplete="off"
            />
          </form>
          {showDropdown && (
            <SearchDropdown
              keyword={searchValue}
              results={searchResults}
              loading={searchLoading}
              onClose={closeDropdown}
            />
          )}
        </div>

        <div className="drawer__divider" />

        {STATIC_LEFT.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `drawer__link${isActive ? " active" : ""}`
            }
            onClick={() => setMobileOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}

        {/* Thể loại */}
        <button
          className={`drawer__link ${openDrawerItem === "genre" ? "expanded" : ""}`}
          onClick={() =>
            setOpenDrawerItem((p) => (p === "genre" ? null : "genre"))
          }
        >
          Thể loại <ChevronIcon />
        </button>
        <div
          className={`drawer__sub ${openDrawerItem === "genre" ? "open" : ""}`}
        >
          {categoryGrid.map((c) => (
            <Link
              key={c._id}
              to={`/the-loai/${c.slug}`}
              className="drawer__sub-link"
              onClick={() => setMobileOpen(false)}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* Quốc gia */}
        <button
          className={`drawer__link ${openDrawerItem === "country" ? "expanded" : ""}`}
          onClick={() =>
            setOpenDrawerItem((p) => (p === "country" ? null : "country"))
          }
        >
          Quốc gia <ChevronIcon />
        </button>
        <div
          className={`drawer__sub ${openDrawerItem === "country" ? "open" : ""}`}
        >
          {countryGrid.map((c) => (
            <Link
              key={c._id}
              to={`/quoc-gia/${c.slug}`}
              className="drawer__sub-link"
              onClick={() => setMobileOpen(false)}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="drawer__divider" />

        <NavLink
          to="/quoc-gia/viet-nam"
          className={({ isActive }) =>
            `drawer__link${isActive ? " active" : ""}`
          }
          onClick={() => setMobileOpen(false)}
        >
          Phim Việt Nam
        </NavLink>
      </div>
    </>
  );
}
