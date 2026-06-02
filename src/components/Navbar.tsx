import { Link } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { CalendarPlus, Ticket, UserCircle } from 'lucide-react';
import './Navbar.css';

export const Navbar = ({ user }: { user: User | null }) => {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="wordmark">CampusTix</Link>
      </div>
      <div className="nav-center">
        <Link to="/">Home</Link>
        {user && <Link to="/tickets">Tickets</Link>}
        {user && (
          <Link to="/admin/add-event" className="nav-action-link">
            <CalendarPlus size={16} aria-hidden="true" />
            Buat Event
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
