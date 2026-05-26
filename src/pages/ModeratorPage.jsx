import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getPath, useLang } from '@/utils/lang';
import { Shield, MessageSquare, Megaphone, Menu, X, Home, Settings } from 'lucide-react';
import ContactPanel from '@/components/Moderator/ContactPanel';
import AnnouncementPanel from '@/components/Moderator/AnnouncementPanel';
import SettingsModal from '@/components/SettingsModal/SettingsModal';
import './ModeratorPage.css';
import './AdminPanel.css';
import './TicketShared.css';

export default function ModeratorPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'contacts';
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    document.title = `${t.tickets.modTitle || 'Quản trị viên'} - GienPhim`;
  }, [t.tickets.modTitle]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate(getPath('login')); return; }
    if (!user || !['MODERATOR', 'ADMIN'].includes(user.role)) {
      navigate(getPath('home')); return;
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  if (authLoading) return null;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="admin-page-container">
      {!isSidebarOpen && (
        <button className="sidebar-toggle-btn mobile-only" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
      )}

      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <div className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className={`sidebar-header ${isSidebarOpen ? '' : 'closed'}`}>
          {isSidebarOpen && (
            <div className="sidebar-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={32} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700 }}>{user?.role === 'ADMIN' ? t.admin.adminPanel : t.admin.managerPanel}</span>
                <span className={`role-badge ${user?.role === 'ADMIN' ? 'admin' : 'mod'}`} style={{ fontSize: '9px', padding: '2px 8px', letterSpacing: '0.5px', alignSelf: 'flex-start' }}>
                  {user?.role === 'ADMIN' ? 'ADMIN' : 'MODERATOR'}
                </span>
              </div>
            </div>
          )}
          <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="sidebar-menu">
          <button
            className={`sidebar-menu-item ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => handleTabChange('contacts')}
          >
            <MessageSquare size={20} />
            {isSidebarOpen && <span>{t.admin.manageContacts}</span>}
          </button>
          <button
            className={`sidebar-menu-item ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => handleTabChange('announcements')}
          >
            <Megaphone size={20} />
            {isSidebarOpen && <span>{t.admin.manageAnnouncements}</span>}
          </button>
        </div>

        <div className={`sidebar-footer ${isSidebarOpen ? '' : 'closed'}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: isSidebarOpen ? '20px' : '20px 0' }}>
          <button
            className="sidebar-menu-item"
            onClick={() => navigate(getPath('home'))}
            style={{ justifyContent: isSidebarOpen ? 'flex-start' : 'center', padding: isSidebarOpen ? '12px 20px' : '12px 0' }}
          >
            <Home size={20} />
            {isSidebarOpen && <span>{t.common?.home || 'Trang chủ'}</span>}
          </button>
          <button
            className="sidebar-menu-item"
            onClick={() => setSettingsOpen(true)}
            style={{ justifyContent: isSidebarOpen ? 'flex-start' : 'center', padding: isSidebarOpen ? '12px 20px' : '12px 0' }}
          >
            <Settings size={20} />
            {isSidebarOpen && <span>{t.header?.settings || 'Cài đặt'}</span>}
          </button>
        </div>
      </div>

      <div className="admin-main-content">
        {activeTab === 'contacts' && <ContactPanel />}
        {activeTab === 'announcements' && <AnnouncementPanel />}
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        lang={lang}
      />
    </div>
  );
}
