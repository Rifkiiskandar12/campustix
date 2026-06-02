import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, type Event, type Booking } from '../lib/supabase';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'events' | 'verifications'>('events');
  
  // State untuk data
  const [events, setEvents] = useState<Event[]>([]);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);

  // Fetch Data Event
  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('date', { ascending: false });
    if (data) setEvents(data);
  };

  // Fetch Data Verifikasi
  const fetchPending = async () => {
    const { data } = await supabase.from('bookings').select('*').eq('status', 'pending').order('createdAt', { ascending: false });
    if (data) setPendingBookings(data as Booking[]);
  };

  useEffect(() => {
    fetchEvents();
    fetchPending();
  }, []);

  // Handler Hapus Event
  const handleDeleteEvent = async (id: string, title: string) => {
    if (window.confirm(`Yakin ingin menghapus event "${title}"?`)) {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) alert('Gagal menghapus: ' + error.message);
      else fetchEvents();
    }
  };

  // Handler Verifikasi Pembayaran
  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', id);
    if (error) alert("Gagal update: " + error.message);
    else fetchPending();
  };

  return (
    <div className="page-enter-active admin-dash-layout">
      <div className="admin-dash-header">
        <h2>Admin Panel</h2>
        {activeTab === 'events' && (
          <button className="pill-btn pill-primary" onClick={() => navigate('/admin/add-event')}>
            + Buat Event Baru
          </button>
        )}
      </div>

      {/* Sistem Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`} 
          onClick={() => setActiveTab('events')}
        >
          Daftar Event
        </button>
        <button 
          className={`tab-btn ${activeTab === 'verifications' ? 'active' : ''}`} 
          onClick={() => setActiveTab('verifications')}
        >
          Verifikasi Pembayaran 
          {pendingBookings.length > 0 && <span className="badge-count">{pendingBookings.length}</span>}
        </button>
      </div>

      {/* Konten Tab: DAFTAR EVENT */}
      {activeTab === 'events' && (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Tanggal</th>
                <th>Kapasitas</th>
                <th>Terjual</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center' }}>Belum ada event.</td></tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id}>
                    <td><strong>{event.title}</strong></td>
                    <td>{new Date(event.date).toLocaleDateString('id-ID')}</td>
                    <td>{event.capacity}</td>
                    <td>{event.soldCount}</td>
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

      {/* Konten Tab: VERIFIKASI PEMBAYARAN */}
      {activeTab === 'verifications' && (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Event & Tiket</th>
                <th>Total Bayar</th>
                <th>Bukti Transfer</th>
                <th>Aksi</th>
              </tr>
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
                    <td>
                      <strong>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(b.totalPrice)}</strong>
                    </td>
                    <td>
                      <a href={b.paymentProofUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
                        Lihat Bukti ↗
                      </a>
                    </td>
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
    </div>
  );
};