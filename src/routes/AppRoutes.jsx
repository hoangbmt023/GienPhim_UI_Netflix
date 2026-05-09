import { Navigate, Route, Routes } from 'react-router-dom';
import { PATHS, getPath } from '@/utils/lang';
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
import AuthPage        from '@/pages/AuthPage';
import ProfilesPage    from '@/pages/ProfilesPage';
import MyListHistoryPage from '@/pages/MyListHistoryPage';

const renderDualRoute = (pathKey, element, suffix = '') => {
  const routes = [<Route key={`${pathKey}-en`} path={PATHS[pathKey].en + suffix} element={element} />];
  if (PATHS[pathKey].vi !== PATHS[pathKey].en) {
    routes.push(<Route key={`${pathKey}-vi`} path={PATHS[pathKey].vi + suffix} element={element} />);
  }
  return routes;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={getPath('home')} replace />} />
      {renderDualRoute('login', <AuthPage initialView="LOGIN" />)}
      {renderDualRoute('register', <AuthPage initialView="REGISTER" />)}
      {renderDualRoute('forgotPassword', <AuthPage initialView="FORGOT_PASSWORD" />)}
      {renderDualRoute('verifyOtp', <AuthPage initialView="VERIFY_OTP" />)}
      {renderDualRoute('resetPassword', <AuthPage initialView="RESET_PASSWORD" />)}
      {renderDualRoute('profiles', <ProfilesPage />)}

      <Route element={<MainLayout />}>
        {/* Main curated pages */}
        {renderDualRoute('home', <HomePage />)}
        {renderDualRoute('series', <PhimBoPage />)}
        {renderDualRoute('movies', <PhimLePage />)}
        {renderDualRoute('newReleases', <PhimMoiPage />)}
        {renderDualRoute('animation', <HoatHinhPage />)}

        {/* Vietnam landing page (special, no pagination) */}
        {renderDualRoute('countryVietnam', <VietnamPage />)}

        {/* Browse pages – có pagination */}
        {renderDualRoute('search', <BrowsePage type="search" />)}
        {renderDualRoute('list', <BrowsePage type="list" />, "/:slug")}
        {renderDualRoute('category', <BrowsePage type="category" />, "/:slug")}
        {renderDualRoute('country', <BrowsePage type="country" />, "/:slug")}
        {renderDualRoute('year', <BrowsePage type="year" />, "/:slug")}

        {/* Chi tiết phim */}
        {renderDualRoute('movie', <MovieDetailPage />, "/:slug")}

        {/* Static Pages wrapped in SupportLayout */}
        <Route element={<SupportLayout />}>
          {renderDualRoute('about', <AboutPage />)}
          {renderDualRoute('privacy', <PolicyPage />)}
          {renderDualRoute('terms', <TermsPage />)}
          {renderDualRoute('faq', <FaqPage />)}
          {renderDualRoute('contact', <ContactPage />)}
        </Route>

        {renderDualRoute('myList', <MyListHistoryPage />)}

      </Route>

      {/* 404 Catch-all inside MainLayout */}
      <Route path="*" element={<NotFoundPage />} />

      {/* Xem phim – có header riêng, không dùng MainLayout */}
      {renderDualRoute('watch', <WatchPage />, "/:slug")}
    </Routes>
  );
}
