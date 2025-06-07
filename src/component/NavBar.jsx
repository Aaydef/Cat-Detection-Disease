import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import webLogo from '../assets/paw.png';
import userprofile from '../assets/userprofile.png';


const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const isGuestPage = ['/', '/diseaseinfo', '/login', '/register'].includes(location.pathname);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      localStorage.removeItem('user');
      setUser(null);
      navigate('/');
    }
  };

  const isPublicHome = location.pathname === '/';

  return (
    <div className="nav-row">
      {/* Kiri: Logo dan Judul */}
    <div className="nav-top">
      <div className="nav-left">
        <img className="icon-paw" src={webLogo} alt="logo" />
        <div className="title">
          <h1>DETECT DISEASE</h1>
          <h2>Cat Skin Disease</h2>
        </div>
      </div>


      {/* Kanan: Navigasi */}
      {(user || isGuestPage) && (
        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>
      )}

{/* Kanan: Navigasi */}
    <div className={`nav-right ${menuOpen ? 'open' : ''}`}>
      <div className="features">
        {!user ? (
          <>
            <NavLink
              to="/"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => isActive ? "btn-info active" : "btn-info"}
            >
              Detect
            </NavLink>
            <NavLink
              to="/diseaseinfo"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => isActive ? "btn-info active" : "btn-info"}
            >
              Disease Info
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/Home"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => isActive ? "btn-home active" : "btn-home"}
            >
              Home
            </NavLink>
            <NavLink
              to="/History"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => isActive ? "btn-history active" : "btn-history"}
            >
              History
            </NavLink>
            <NavLink
              to="/diseaseinfo"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => isActive ? "btn-info active" : "btn-info"}
            >
              Disease Info
            </NavLink>
          </>
        )}
      </div>

      {/* Login / Logout */}
      {!user ? (
        isPublicHome && (
          <NavLink to="/login" className="btn-login">
            🔐 Login
          </NavLink>
        )
      ) : (
        <div className="profile-section" title="User Menu">
          <img
            src={userprofile}
            alt="profile"
            className="profile-icon"
            onClick={() => setShowLogout((prev) => !prev)}
          />
          <div className="username">{user.username}</div>

          <button
            className={`btn-logout ${showLogout ? 'active' : ''}`}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  </div>
  </div>
  );
};

export default NavBar;
