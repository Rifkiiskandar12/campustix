import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Profile.css';

export const Profile = ({ user }: { user: any }) => {
  const navigate = useNavigate();
  const [ticketCount, setTicketCount] = useState(0);

  // Ambil data total tiket yang pernah dibeli
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      const { count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('userId', user.id);
      
      if (count) setTicketCount(count);
    };
    fetchStats();
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Identifikasi peran (Role)
  const adminEmails = ['jaaaa7126@gmail.com']; 
  const isAdmin = user && user.email && adminEmails.includes(user.email);
  const roleLabel = isAdmin ? 'Admin / Panitia' : 'Mahasiswa';

  const { full_name, avatar_url, email } = user?.user_metadata || {};

  return (
    <div className="page-enter-active profile-layout">
      <div className="profile-header">
        <h2>Akun Saya</h2>
        <button className="pill-btn pill-secondary btn-sm" onClick={handleSignOut}>
          Keluar
        </button>
      </div>

      <div className="profile-card">
        {avatar_url ? (
          <img src={avatar_url} alt="Profile" className="profile-avatar" />
        ) : (
          <div className="profile-avatar-fallback">
            {full_name ? full_name.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
        
        <div className="profile-info">
          <p className="profile-name">{full_name || 'Campus Student'}</p>
          <p className="profile-email">{email || user?.email}</p>
          <span className={`role-badge ${isAdmin ? 'role-admin' : 'role-user'}`}>
            {roleLabel}
          </span>
        </div>
      </div>
      
      {/* Bagian Statistik / Mini Dashboard */}
      <div className="profile-stats">
        <div className="stat-card">
          <span className="stat-value">{ticketCount}</span>
          <span className="stat-label">Total Tiket Dibeli</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{isAdmin ? 'Tak Terbatas' : 'Basic'}</span>
          <span className="stat-label">Tipe Akun</span>
        </div>
      </div>

      {/* Area Pengaturan (Pintasan Fungsional) */}
      <div className="profile-settings">
        <h3>Pengaturan Aplikasi</h3>
        <div className="settings-list">
          {/* Arahkan ke halaman My Tickets */}
          <button className="setting-item" onClick={() => navigate('/tickets')}>
            <span>Riwayat Transaksi Lengkap</span>
            <span className="arrow">→</span>
          </button>
          
          {/* Arahkan ke halaman Support baru */}
          <button className="setting-item" onClick={() => navigate('/support')}>
            <span>Bantuan & Dukungan</span>
            <span className="arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};