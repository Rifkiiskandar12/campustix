import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Profile.css';

export const Profile = ({ user }: { user: any }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Google OAuth metadata is stored in user.user_metadata
  const { full_name, avatar_url, email } = user?.user_metadata || {};

  return (
    <div className="page-enter-active profile-layout">
      <h2>Profile</h2>
      <div className="profile-card">
        {avatar_url && (
          <img src={avatar_url} alt="Profile" className="profile-avatar" />
        )}
        <div className="profile-info">
          <p className="profile-name">{full_name || 'Campus Student'}</p>
          <p className="profile-email">{email || user?.email}</p>
        </div>
      </div>
      
      <div style={{ marginTop: 'var(--space-8)' }}>
        <button className="pill-btn pill-secondary" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
};