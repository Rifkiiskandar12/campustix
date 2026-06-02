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
      
      if (data) setTickets(data);
    };
    fetchTickets();
  }, [user]);

  return (
    <div className="page-enter-active workbench-layout">
      <h2>My Tickets</h2>
      <div className="ticket-list">
        {tickets.map(ticket => (
          <div key={ticket.id} className="ticket-item">
            <div className="ticket-info">
              <h3>{ticket.eventTitle}</h3>
              <p className="ticket-meta">
                {new Date(ticket.eventDate).toLocaleDateString()} &bull; {ticket.ticketType} x{ticket.quantity}
              </p>
            </div>
            <div className="ticket-code">
              {/* Enforced JetBrains Mono via CSS token class */}
              <span className="mono-code">{ticket.ticketCode}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
