import { Link } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { ShieldCheck, Ticket, UserCircle } from 'lucide-react';
import './Navbar.css';

export const Navbar = ({ 
  user, 
  isAdmin = false, 
  isChecker = false 
}: { 
  user: User | null, 
  isAdmin?: boolean, 
  isChecker?: boolean 
}) => {

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="wordmark">CampusTix</Link>
      </div>
      
      <div className="nav-center">
        <Link to="/">Home</Link>
        {user && <Link to="/tickets">My Tickets</Link>}
        {(isAdmin || isChecker) && (
          <Link to="/admin" style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
            {isAdmin ? 'Admin Panel' : 'Panel Petugas'}
          </Link>
        )}
      </div>

      <div className="nav-right">
        {user ? (
          <Link to="/profile" className="avatar-link">
            <UserCircle size={18} aria-hidden="true" />
            Profile
          </Link>
        ) : (
          <Link to="/login" className="pill-btn pill-primary">
            <Ticket size={17} aria-hidden="true" />
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};