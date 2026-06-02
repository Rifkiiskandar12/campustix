import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, type Event } from '../lib/supabase';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('date', { ascending: false });
    if (data) setEvents(data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Yakin ingin menghapus event "${title}"?`)) {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) {
        alert('Gagal menghapus: ' + error.message);
      } else {
        fetchEvents(); // Refresh data setelah berhasil dihapus
      }
    }
  };

  return (
    <div className="page-enter-active admin-dash-layout">
      <div className="admin-dash-header">
        <h2>Admin Dashboard</h2>
        <button className="pill-btn pill-primary" onClick={() => navigate('/admin/add-event')}>
          + Buat Event Baru
        </button>
      </div>

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
                      <button className="pill-btn pill-danger btn-sm" onClick={() => handleDelete(event.id, event.title)}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};