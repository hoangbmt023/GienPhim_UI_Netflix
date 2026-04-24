import Header from '@/components/header/Header'
import Footer  from '@/components/footer/Footer'
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

  const isHeroPage = HERO_PATHS.some(pattern => matchPath(pattern, location.pathname))

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

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
