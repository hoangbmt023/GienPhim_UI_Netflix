import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '@/components/MainLayout/MainLayout';
import HomePage from '@/pages/HomePage';
import PhimBoPage from '@/pages/PhimBoPage';
import PhimLePage from '@/pages/PhimLePage';
import PhimMoiPage from '@/pages/PhimMoiPage';
import HoatHinhPage from '@/pages/HoatHinhPage';
import VietnamPage from '@/pages/VietnamPage';
import BrowsePage from '@/pages/BrowsePage';
import MovieDetailPage from '@/pages/MovieDetailPage';
import WatchPage from '@/pages/WatchPage';
import AboutPage from '@/pages/AboutPage';
import TermsPage from '@/pages/TermsPage';
import PolicyPage from '@/pages/PolicyPage';
import FaqPage         from '@/pages/FaqPage';
import ContactPage     from '@/pages/ContactPage';
import NotFoundPage    from '@/pages/NotFoundPage';
import SupportLayout   from '@/components/SupportLayout/SupportLayout';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />

      <Route element={<MainLayout />}>
        {/* Main curated pages */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/phim-bo" element={<PhimBoPage />} />
        <Route path="/phim-le" element={<PhimLePage />} />
        <Route path="/phim-moi" element={<PhimMoiPage />} />
        <Route path="/hoat-hinh" element={<HoatHinhPage />} />

        {/* Vietnam landing page (special, no pagination) */}
        <Route path="/quoc-gia/viet-nam" element={<VietnamPage />} />

        {/* Browse pages – có pagination */}
        <Route path="/tim-kiem" element={<BrowsePage type="search" />} />
        <Route path="/danh-sach/:slug" element={<BrowsePage type="list" />} />
        <Route path="/the-loai/:slug" element={<BrowsePage type="category" />} />
        <Route path="/quoc-gia/:slug" element={<BrowsePage type="country" />} />
        <Route path="/nam/:slug" element={<BrowsePage type="year" />} />

        {/* Chi tiết phim */}
        <Route path="/phim/:slug" element={<MovieDetailPage />} />

        {/* Static Pages wrapped in SupportLayout */}
        <Route element={<SupportLayout />}>
          <Route path="/gioi-thieu" element={<AboutPage />} />
          <Route path="/chinh-sach-bao-mat" element={<PolicyPage />} />
          <Route path="/dieu-khoan-su-dung" element={<TermsPage />} />
          <Route path="/cau-hoi-thuong-gap" element={<FaqPage />} />
          <Route path="/lien-he" element={<ContactPage />} />
        </Route>

      </Route>

      {/* 404 Catch-all inside MainLayout */}
      <Route path="*" element={<NotFoundPage />} />

      {/* Xem phim – có header riêng, không dùng MainLayout */}
      <Route path="/xem-phim/:slug" element={<WatchPage />} />
    </Routes>
  );
}
