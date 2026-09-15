import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="fatrack-app-shell">
      {/* DESKTOP & MOBILE TOPBAR */}
      <header className="fatrack-topbar">
        <div className="topbar-left">
          <NavLink to="/dashboard" className="brand">
            <span className="avatar">FA</span>
            <b>FATRACK</b>
            <i className="brand-divider">/</i>
            <span className="brand-sub">PERSONAL FINANCE ADVISOR</span>
          </NavLink>
        </div>

        {/* DESKTOP NAVIGATION */}
        <nav className="fatrack-nav desktop-only">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            01 / DASHBOARD
          </NavLink>
          <NavLink
            to="/alokasi"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            02 / ALOKASI
          </NavLink>
          <NavLink
            to="/rekomendasi"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            03 / REKOMENDASI GAYA HIDUP
          </NavLink>
          <NavLink
            to="/transaksi"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            04 / TRANSAKSI
          </NavLink>
        </nav>

        <div className="topbar-right">
          <span className="user-greeting">
            USER: <b>{user?.name || user?.email?.split('@')[0] || 'GUEST'}</b>
          </span>
          <button type="button" className="logout-btn" onClick={handleLogout} title="Keluar dari akun">
            KELUAR →
          </button>
        </div>
      </header>

      {/* MAIN VIEW */}
      <main className="fatrack-main-content">
        {children}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="fatrack-mobile-bottom-nav mobile-only">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? 'bottom-nav-item active' : 'bottom-nav-item')}
        >
          <span className="bottom-nav-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </span>
          <span className="bottom-nav-num">01</span>
          <span className="bottom-nav-label">DASHBOARD</span>
        </NavLink>
        <NavLink
          to="/alokasi"
          className={({ isActive }) => (isActive ? 'bottom-nav-item active' : 'bottom-nav-item')}
        >
          <span className="bottom-nav-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </span>
          <span className="bottom-nav-num">02</span>
          <span className="bottom-nav-label">ALOKASI</span>
        </NavLink>
        <NavLink
          to="/rekomendasi"
          className={({ isActive }) => (isActive ? 'bottom-nav-item active' : 'bottom-nav-item')}
        >
          <span className="bottom-nav-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </span>
          <span className="bottom-nav-num">03</span>
          <span className="bottom-nav-label">LIFESTYLE</span>
        </NavLink>
        <NavLink
          to="/transaksi"
          className={({ isActive }) => (isActive ? 'bottom-nav-item active' : 'bottom-nav-item')}
        >
          <span className="bottom-nav-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </span>
          <span className="bottom-nav-num">04</span>
          <span className="bottom-nav-label">TRANSAKSI</span>
        </NavLink>
      </nav>

      {/* SWISS FOOTER */}
      <footer className="fatrack-footer">
        <div className="footer-col">
          <small>01 / PROTOKOL FATRACK</small>
          <p>Sistem rekomendasi gaya hidup dan pengawasan arus kas harian berbasis presisi matematika.</p>
        </div>
        <div className="footer-col">
          <small>02 / STATUS ENKRIPSI</small>
          <p>DATA LEVEL: SUPABASE RLS & LOCAL SECURE STORAGE</p>
        </div>
        <div className="footer-col">
          <small>03 / FORMULA STANDAR</small>
          <p>SAFE-TO-SPEND DAILY ALGORITHM & 50/30/20 ADAPTIVE RATIO</p>
        </div>
        <div className="footer-col">
          <small>04 / VERSI SISTEM</small>
          <p>FATRACK V1.0 (MVP RELEASE)</p>
        </div>
      </footer>
    </div>
  );
};
