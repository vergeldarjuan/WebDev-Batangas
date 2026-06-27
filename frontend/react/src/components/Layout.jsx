// Layout.jsx - site header, navigation, and footer wrapper
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

function BrandMark() {
  return (
    <svg className="mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <circle cx="16" cy="16" r="10.5" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
      <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="16" cy="16" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function Layout({ user, onLogout, onOpenAuth, children }) {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 60 || location.pathname !== '/');

    updateScrolled();
    window.addEventListener('scroll', updateScrolled);

    return () => window.removeEventListener('scroll', updateScrolled);
  }, [location.pathname]);

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    window.requestAnimationFrame(() => {
      document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [location.pathname, location.hash]);

  return (
    <>
      <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
        <Link to="/" className="nav-logo">
          <BrandMark />
          Batangas Province
        </Link>

        <ul className="nav-links">
          <li><Link to="/#origin">Origin</Link></li>
          <li><Link to="/#about">Heritage</Link></li>
          <li><Link to="/#destinations">Destinations</Link></li>
          <li><Link to="/#food">Food</Link></li>
          <li><Link to="/#events">Events</Link></li>
          <li><NavLink to="/listings">Listings</NavLink></li>
          <li><NavLink to="/user">{user ? 'Profile' : 'User'}</NavLink></li>
          {user?.role == 'admin' ? (<li><NavLink to="/admin">Admin</NavLink></li>) : null}
  
          {user ? (
            <li><button type="button" className="nav-button" onClick={onLogout}>Logout</button></li>
          ) : (
            <li><button type="button" className="nav-button" onClick={() => onOpenAuth('login')}>Sign In</button></li>
          )}
        </ul>
      </nav>

      {children}

      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="nav-logo">
              <BrandMark />
              Batangas Province
            </Link>
            <p>Showcasing Batangas Province, its origin, heritage, destinations, food, events, and bookable travel services.</p>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <ul>
              <li><Link to="/#origin">Name Origin</Link></li>
              <li><Link to="/#about">Heritage</Link></li>
              <li><Link to="/#destinations">Destinations</Link></li>
              <li><Link to="/#events">Events</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Practical</h4>
            <ul>
              <li><Link to="/listings?category=Apartment">Book a Stay</Link></li>
              <li><Link to="/listings?category=Car">Rent a Vehicle</Link></li>
              <li><Link to="/user">My Bookings</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Official Channels</h4>
            <ul>
              <li><a href="https://www.batangas.gov.ph/" target="_blank" rel="noreferrer">Provincial Government Site</a></li>
              <li><a href="https://www.batangas.gov.ph/" target="_blank" rel="noreferrer">Contact & Directory</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>2026 WEB DEVELOPMENT GROUP 14. ALL RIGHTS RESERVED.</span>
          <span>Eto Batangueno Disiplinado</span>
        </div>
      </footer>
    </>
  );
}
