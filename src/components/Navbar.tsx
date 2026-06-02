import { Link } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { ShieldCheck, Ticket, UserCircle } from 'lucide-react';
import './Navbar.css';

export const Navbar = ({ user }: { user: User | null }) => {
  // Ganti dengan email Anda, misal: rifki@kampus.edu atau email pribadi
  const adminEmails = ['jaaaa7126@gmail.com'];
  const isAdmin = Boolean(user?.email && adminEmails.includes(user.email));

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="wordmark">CampusTix</Link>
      </div>
      <div className="nav-center">
        <Link to="/">Home</Link>
        {user && <Link to="/tickets">My Tickets</Link>}
        
        {/* Panel Menu Khusus Admin */}
        {isAdmin && (
          <>
            <Link to="/admin" style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
              Admin Panel
            </Link>
          </>
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
