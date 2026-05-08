import { NavLink, Outlet } from 'react-router-dom';
import './SupportLayout.css';
import { useLang, getPath } from '@/utils/lang';

export default function SupportLayout() {
  const { t } = useLang();

  const SUPPORT_LINKS = [
    { to: getPath('about'), label: t.supportLayout.about },
    { to: getPath('faq'), label: t.supportLayout.faq },
    { to: getPath('privacy'), label: t.supportLayout.privacy },
    { to: getPath('terms'), label: t.supportLayout.terms },
    { to: getPath('contact'), label: t.supportLayout.contact },
  ];

  return (
    <div className="support-layout">
      <div className="support-container">
        {/* SIDEBAR */}
        <aside className="support-sidebar">
          <h2 className="support-sidebar-title">{t.supportLayout.sidebarTitle}</h2>
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
