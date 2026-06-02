import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { supabase, type Event } from '../lib/supabase';
import './EventDetail.css';

export const EventDetail = ({ user }: { user: User | null }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [qty, setQty] = useState(1);
  const [ticketType, setTicketType] = useState('General');

  useEffect(() => {
    const getEvent = async () => {
      const { data } = await supabase.from('events').select('*').eq('id', id).single();
      setEvent(data);
    };
    getEvent();
  }, [id]);

  const handleBook = async () => {
    if (!user) return navigate('/'); // Ideally trigger auth modal or redirect
    
    const ticketCode = `CTX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Silent state change (no toast as per requirements)
    await supabase.from('bookings').insert({
      userId: user.id,
      eventId: event?.id,
      eventTitle: event?.title,
      eventDate: event?.date,
      ticketType,
      quantity: qty,
      totalPrice: (event?.price || 0) * qty,
      ticketCode
    });

    navigate('/tickets');
  };

  if (!event) return null;

  return (
    <div className="page-enter-active split-studio">
      <div className="panel-left">
        <img src={event.imageUrl} alt={event.title} className="detail-hero-img" />
        <div className="detail-meta">
          <p className="detail-date">{new Date(event.date).toLocaleString()}</p>
          <h2>{event.title}</h2>
          <p className="organizer">By {event.organizerName}</p>
          <p className="desc">{event.description}</p>
        </div>
      </div>
      
      <div className="panel-right">
        <div className="booking-workbench">
          <h3>Booking</h3>
          <p className="booking-copy">{event.venue}</p>
          
          <div className="seat-selector">
            {['General', 'VIP'].map(type => (
              <button 
                key={type}
                className={`ticket-type-card ${ticketType === type ? 'selected' : ''}`}
                onClick={() => setTicketType(type)}
                aria-pressed={ticketType === type}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="quantity-control">
            <label>Quantity</label>
            <input 
              type="number" 
              min="1" 
              max="10" 
              value={qty} 
              onChange={e => setQty(Number(e.target.value))} 
              className="field-control"
            />
          </div>

          <div className="summary">
            <span>Total</span>
            <span className="price">${event.price * qty}</span>
          </div>

          <button className="pill-btn pill-primary full-width" onClick={handleBook}>
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};
