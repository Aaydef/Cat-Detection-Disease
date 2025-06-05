// components/NavBar.jsx
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

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
      navigate('/'); // kembali ke publicHome
    }
  };

  // Cek apakah sedang berada di halaman PublicHome
  const isPublicHome = location.pathname === '/';

  return (
    <div className="nav-row">
      <div className="nav-left">
        <img className="icon-paw" src="src/assets/paw.png" alt="logo" />
        <div className="title">
          <h1>DETECT DISEASE</h1>
          <h2>Cat Skin Disease</h2>
        </div>
      </div>

   <div className="nav-right">
  <div className="features">
    {!user ? (
      // 👤 Guest (public home)
      <>
        <NavLink to="/" className={({ isActive }) => isActive ? "btn-info active" : "btn-info"}>Detect</NavLink>
        <NavLink to="/diseaseinfo" className={({ isActive }) => isActive ? "btn-info active" : "btn-info"}>Disease Info</NavLink>
      </>
    ) : (
      // 🔒 Logged in
      <>
        <NavLink to="/Home" className={({ isActive }) => isActive ? "btn-home active" : "btn-home"}>Home</NavLink>
        <NavLink to="/History" className={({ isActive }) => isActive ? "btn-history active" : "btn-history"}>History</NavLink>
        <NavLink to="/diseaseinfo" className={({ isActive }) => isActive ? "btn-info active" : "btn-info"}>Disease Info</NavLink>
      </>
    )}
  </div>

  {/* Login/Logout Section */}
  {!user ? (
    isPublicHome && <NavLink to="/login" className="btn-login">Login</NavLink>
  ) : (
    <div className="profile-section" onClick={handleLogout} title="Logout">
      <img src="src/assets/userprofile.png" alt="profile" className="profile-icon" />
      <div className="username">{user.username}</div>
    </div>
  )}
</div>

    </div>
  );
};

export default NavBar;
