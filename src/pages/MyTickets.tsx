import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, type Booking } from '../lib/supabase';
import './MyTickets.css';

export const MyTickets = ({ user }: { user: User | null }) => {
  const [tickets, setTickets] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false });
      
      if (data) setTickets(data as Booking[]);
    };
    fetchTickets();
  }, [user]); 

  return (
    <div className="page-enter-active workbench-layout">
      <h2>My Tickets</h2>
      
      <div className="ticket-list">
        {tickets.length === 0 ? (
          <p style={{ color: 'var(--color-muted)' }}>Belum ada riwayat pemesanan tiket.</p>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="ticket-item">
              <div className="ticket-info">
                <h3>{ticket.eventTitle}</h3>
                <p className="ticket-meta">
                  {new Date(ticket.eventDate).toLocaleDateString('id-ID')} &bull; {ticket.ticketType} x{ticket.quantity}
                </p>
                
                <span style={{
                  display: 'inline-block', marginTop: '8px', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700,
                  backgroundColor: ticket.status === 'approved' ? 'oklch(90% 0.1 150)' : ticket.status === 'rejected' ? 'oklch(90% 0.1 25)' : 'var(--color-paper-3)',
                  color: ticket.status === 'approved' ? 'oklch(40% 0.1 150)' : ticket.status === 'rejected' ? 'oklch(40% 0.1 25)' : 'var(--color-ink-2)'
                }}>
                  {ticket.status ? ticket.status.toUpperCase() : 'PENDING'}
                </span>
              </div>

              <div className="ticket-code">
                {ticket.status === 'approved' ? (
                  <span className="mono-code">{ticket.ticketCode}</span>
                ) : ticket.status === 'rejected' ? (
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>Ditolak</span>
                ) : (
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>Menunggu Verifikasi</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};