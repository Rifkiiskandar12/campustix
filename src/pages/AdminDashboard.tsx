import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, type Event, type Booking } from '../lib/supabase';
import './AdminDashboard.css';

export const AdminDashboard = ({ isAdmin }: { isAdmin?: boolean }) => {
  const navigate = useNavigate();
  // Jika admin, buka 'overview'. Jika petugas, langsung buka 'checkin'
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'verifications' | 'checkin' | 'users'>(isAdmin ? 'overview' : 'checkin');
  
  const [profiles, setProfiles] = useState<any[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]); 
  
  // State khusus Check-in
  const [checkInCode, setCheckInCode] = useState('');
  const [checkInResult, setCheckInResult] = useState<Booking | null>(null);
  const [checkInMessage, setCheckInMessage] = useState('');

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('date', { ascending: false });
    if (data) setEvents(data);
  };

  const fetchBookings = async () => {
    const { data } = await supabase.from('bookings').select('*').order('createdAt', { ascending: false });
    if (data) setAllBookings(data as Booking[]);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setProfiles(data);
  };

  useEffect(() => {
    fetchEvents();
    fetchBookings();
    fetchProfiles();
  }, []);

  // Filter dan Kalkulasi Data untuk Statistik
  const pendingBookings = allBookings.filter(b => b.status === 'pending');
  const approvedBookings = allBookings.filter(b => b.status === 'approved');
  
  const totalRevenue = approvedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalTicketsSold = approvedBookings.reduce((sum, b) => sum + b.quantity, 0);
  const totalCheckIn = approvedBookings.filter(b => b.isUsed).length;

  // Handlers
  const handleDeleteEvent = async (id: string, title: string) => {
    if (window.confirm(`Yakin ingin menghapus event "${title}"?`)) {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (!error) fetchEvents();
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', id);
    if (!error) fetchBookings(); 
  };

  const handleSearchTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckInMessage('');
    setCheckInResult(null);
    if (!checkInCode.trim()) return;

    const { data, error } = await supabase.from('bookings').select('*').eq('ticketCode', checkInCode.trim().toUpperCase()).single();
    if (error || !data) setCheckInMessage('❌ Tiket tidak ditemukan.');
    else setCheckInResult(data as Booking);
  };

  const handleMarkAsUsed = async (id: string) => {
    if (!window.confirm('Izinkan pengunjung masuk?')) return;
    const { error } = await supabase.from('bookings').update({ isUsed: true }).eq('id', id);
    if (!error) {
      alert("Berhasil!");
      setCheckInResult(prev => prev ? { ...prev, isUsed: true } : null);
      fetchBookings(); 
    }
  };

  return (
    <div className="page-enter-active admin-dash-layout">
      <div className="admin-dash-header">
        <h2>{isAdmin ? 'Admin Panel' : 'Panel Petugas Check-in'}</h2>
        {isAdmin && activeTab === 'events' && (
          <button className="pill-btn pill-primary" onClick={() => navigate('/admin/add-event')}>
            + Buat Event Baru
          </button>
        )}
      </div>

      <div className="admin-tabs">
        {/* SEMBUNYIKAN 4 TAB INI DARI PETUGAS */}
        {isAdmin && (
          <>
            <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              Ringkasan
            </button>
            <button className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
              Daftar Event
            </button>
            <button className={`tab-btn ${activeTab === 'verifications' ? 'active' : ''}`} onClick={() => setActiveTab('verifications')}>
              Verifikasi {pendingBookings.length > 0 && <span className="badge-count">{pendingBookings.length}</span>}
            </button>
            <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
              Pengguna
            </button>
          </>
        )}
        
        {/* TAB INI DIBIARKAN AGAR BISA DILIHAT OLEH SEMUA (ADMIN & PETUGAS) */}
        <button className={`tab-btn ${activeTab === 'checkin' ? 'active' : ''}`} onClick={() => setActiveTab('checkin')}>
          Check-in Pintu
        </button>
      </div>

    {/* ================= TAB 1: RINGKASAN DATA ================= */}
      {activeTab === 'overview' && (
        <div className="overview-container">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-title">Total Pendapatan</span>
              <span className="stat-value highlight">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalRevenue)}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Tiket Terjual Lunas</span>
              <span className="stat-value">{totalTicketsSold}</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Pengunjung Hadir</span>
              <span className="stat-value">{totalCheckIn} <span style={{fontSize:'1rem', color:'var(--color-muted)'}}>orang</span></span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Event Aktif</span>
              <span className="stat-value">{events.length}</span>
            </div>
          </div>

          <h3 style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>5 Transaksi Sukses Terakhir</h3>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr><th>Kode Tiket</th><th>Event</th><th>Pembeli (ID)</th><th>Total</th></tr>
              </thead>
              <tbody>
                {approvedBookings.slice(0, 5).length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center' }}>Belum ada transaksi sukses.</td></tr>
                ) : (
                  approvedBookings.slice(0, 5).map(b => (
                    <tr key={b.id}>
                      <td className="mono-text">{b.ticketCode}</td>
                      <td>{b.eventTitle} ({b.ticketType} x{b.quantity})</td>
                      <td style={{ fontSize: '0.85rem' }}>{b.userId?.substring(0,8) || 'Unknown'}...</td>
                      <td>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(b.totalPrice)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: DAFTAR EVENT ================= */}
      {activeTab === 'events' && (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr><th>Event</th><th>Tanggal</th><th>Kapasitas</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center' }}>Belum ada event.</td></tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id}>
                    <td><strong>{event.title}</strong></td>
                    <td>{new Date(event.date).toLocaleDateString('id-ID')}</td>
                    <td>{event.capacity}</td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/admin/edit-event/${event.id}`} className="pill-btn pill-secondary btn-sm">Edit</Link>
                        <button className="pill-btn pill-danger btn-sm" onClick={() => handleDeleteEvent(event.id, event.title)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= TAB 3: VERIFIKASI ================= */}
      {activeTab === 'verifications' && (
        <div className="table-container">
           <table className="admin-table">
            <thead>
              <tr><th>Event & Tiket</th><th>Total Bayar</th><th>Bukti Transfer</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {pendingBookings.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>Semua pembayaran sudah diverifikasi! 🎉</td></tr>
              ) : (
                pendingBookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <strong>{b.eventTitle}</strong><br/>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>{b.ticketType} x{b.quantity}</span>
                    </td>
                    <td><strong>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(b.totalPrice)}</strong></td>
                    <td><a href={b.paymentProofUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)', fontWeight: 700 }}>Lihat Bukti ↗</a></td>
                    <td>
                      <div className="action-buttons">
                        <button className="pill-btn pill-primary btn-sm" onClick={() => handleUpdateStatus(b.id, 'approved')}>Setujui</button>
                        <button className="pill-btn pill-danger btn-sm" onClick={() => handleUpdateStatus(b.id, 'rejected')}>Tolak</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= TAB 4: CHECK-IN ================= */}
      {activeTab === 'checkin' && (
        <div className="checkin-container">
          <form className="checkin-form" onSubmit={handleSearchTicket}>
            <input type="text" placeholder="Masukkan Kode Tiket (Contoh: CTX-ABCD12)" value={checkInCode} onChange={(e) => setCheckInCode(e.target.value)} required />
            <button type="submit" className="pill-btn pill-primary">Cari Tiket</button>
          </form>
          {checkInMessage && <p className="checkin-error">{checkInMessage}</p>}
          {checkInResult && (
            <div className="checkin-card">
              <div className="checkin-header">
                <h3>{checkInResult.eventTitle}</h3>
                <span className={`status-badge ${checkInResult.status === 'approved' ? 'valid' : 'invalid'}`}>
                  {checkInResult.status === 'approved' ? 'LUNAS' : 'BELUM LUNAS'}
                </span>
              </div>
              <div className="checkin-details">
                <p><strong>Kode:</strong> <span className="mono-text">{checkInResult.ticketCode}</span></p>
                <p><strong>Tipe:</strong> {checkInResult.ticketType}</p>
                <p><strong>Jumlah:</strong> {checkInResult.quantity} Orang</p>
              </div>
              {checkInResult.status !== 'approved' ? (
                <div className="alert-box error">Tiket ini belum lunas / ditolak. Dilarang masuk!</div>
              ) : checkInResult.isUsed ? (
                <div className="alert-box warning">⚠️ TIKET SUDAH DIGUNAKAN!</div>
              ) : (
                <button className="pill-btn pill-primary full-width" onClick={() => handleMarkAsUsed(checkInResult.id)} style={{ marginTop: 'var(--space-4)' }}>
                  Gunakan Tiket & Izinkan Masuk
                </button>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* ================= TAB 5: MANAJEMEN PENGGUNA ================= */}
      {activeTab === 'users' && (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Pengguna</th>
                <th>Email</th>
                <th>ID Akun</th>
                <th>Tanggal Bergabung</th>
              </tr>
            </thead>
            <tbody>
              {profiles.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center' }}>Belum ada data pengguna.</td></tr>
              ) : (
                profiles.map((profile) => (
                  /* Gunakan math.random sbg fallback key jk ID kosong */
                  <tr key={profile.id || Math.random()}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '4px' }} />
                        ) : (
                          <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-paper-3)', borderRadius: '4px' }} />
                        )}
                        <strong>{profile.full_name || 'Tanpa Nama'}</strong>
                      </div>
                    </td>
                    <td>{profile.email || 'Tidak ada email'}</td>
                    {/* Tambahkan ?. agar aman jika ID undefined/null */}
                    <td className="mono-text" style={{ fontSize: '0.85rem' }}>{profile.id?.substring(0, 12) || 'ID Invalid'}...</td>
                    {/* Cek apakah created_at ada sblm di-parse */}
                    <td>{profile.created_at ? new Date(profile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};