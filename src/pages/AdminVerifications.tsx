import { useState, useEffect } from 'react';
import { supabase, type Booking } from '../lib/supabase';
import './AdminVerifications.css';

export const AdminVerifications = () => {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);

  const fetchPending = async () => {
    const { data } = await supabase.from('bookings').select('*').eq('status', 'pending').order('createdAt', { ascending: false });
    if (data) setPendingBookings(data);
  };

  useEffect(() => { fetchPending(); }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', id);
    if (error) {
      alert("Gagal update: " + error.message);
    } else {
      fetchPending(); // Refresh daftar
    }
  };

  return (
    <div className="page-enter-active admin-dash-layout">
      <h2>Verifikasi Pembayaran</h2>
      <p style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-6)' }}>Cek bukti transfer dan setujui tiket mahasiswa.</p>

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
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>Tidak ada antrean verifikasi.</td></tr>
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
    </div>
  );
};