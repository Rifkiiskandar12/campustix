import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Navbar.css'; // Assume standard CSS flexbox layout

export const Navbar = ({ user }: { user: any }) => {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

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
          <button className="pill-btn pill-primary" onClick={handleLogin}>
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};