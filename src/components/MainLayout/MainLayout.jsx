import Header from '@/components/header/Header'
import Footer  from '@/components/footer/Footer'
import AnnouncementBar from '@/components/AnnouncementBar/AnnouncementBar'
import { Outlet, useLocation, matchPath } from 'react-router-dom'
import { useEffect } from 'react'

/* Các trang tự quản lý padding-top (có HeroBanner hoặc hero riêng) */
const HERO_PATHS = [
  '/home',
  '/phim-bo',
  '/phim-le',
  '/phim-moi',
  '/hoat-hinh',
  '/quoc-gia/:slug',
  '/the-loai/:slug',
  '/danh-sach/:slug',
  '/nam/:slug',
  '/phim/:slug',     /* MovieDetailPage – tự lo padding */
];

export default function MainLayout() {
  const location = useLocation()

  /* Scroll lên đầu khi chuyển trang */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  /* Sửa lỗi zoom khi xoay màn hình và lỗi 100vh trên mobile */
  useEffect(() => {
    const handleFixLayout = () => {
      // 1. Sửa lỗi 100vh trên mobile
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);

      // 2. Ép trình duyệt reset lại viewport để tránh kẹt zoom
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        const content = viewport.getAttribute('content');
        viewport.setAttribute('content', content);
      }
    };

    handleFixLayout();
    window.addEventListener('resize', handleFixLayout);
    window.addEventListener('orientationchange', handleFixLayout);

    return () => {
      window.removeEventListener('resize', handleFixLayout);
      window.removeEventListener('orientationchange', handleFixLayout);
    };
  }, []);

  const isHeroPage = HERO_PATHS.some(pattern => matchPath(pattern, location.pathname))

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <AnnouncementBar />

      <main
        className="main-content"
        style={{
          paddingTop: isHeroPage ? 0 : 'var(--header-height)',
          flex: 1,
        }}
      >
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
