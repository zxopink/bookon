import { Outlet, Link } from 'react-router-dom';
import './MainLayout.css';

export default function MainLayout() {
  return (
    <div className="main-layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-icon">📚</span>
            <span className="logo-text">BookOn</span>
          </Link>
        </div>
      </header>
      
      <div className="layout-container">
        <aside className="sidebar">
          <nav className="nav">
            <Link to="/" className="nav-link">
              <span className="nav-icon">🏠</span>
              <span>Home</span>
            </Link>
            <Link to="/popular" className="nav-link">
              <span className="nav-icon">🔥</span>
              <span>Popular</span>
            </Link>
            <Link to="/search" className="nav-link">
              <span className="nav-icon">🔍</span>
              <span>Search</span>
            </Link>
            <Link to="/reading-list" className="nav-link">
              <span className="nav-icon">📖</span>
              <span>Reading List</span>
            </Link>
          </nav>
        </aside>
        
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
