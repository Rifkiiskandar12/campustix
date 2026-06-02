import { Link } from 'react-router-dom';
import './Navbar.css';

export const Navbar = ({ user }: { user: any }) => {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="wordmark">CampusTix</Link>
      </div>
      <div className="nav-center">
        <Link to="/">Home</Link>
        {user && <Link to="/tickets">My Tickets</Link>}
      </div>
      <div className="nav-right">
        {user ? (
          <Link to="/profile" className="avatar-link">Profile</Link>
        ) : (
          // Ubah bagian ini menjadi Link yang mengarah ke /login
          <Link to="/login" className="pill-btn pill-primary" style={{ textDecoration: 'none' }}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};