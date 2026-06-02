import { Link } from 'react-router-dom';
import type { Event } from '../lib/supabase';
import './EventCard.css';

export const EventCard = ({ event }: { event: Event }) => {
  return (
    <Link to={`/event/${event.id}`} className="event-card">
      <div className="card-image-wrapper">
        <img src={event.imageUrl} alt={event.title} loading="lazy" />
        <span className="date-badge">
          {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
      <div className="card-content">
        <h3>{event.title}</h3>
        <p className="venue">{event.venue}</p>
        <div className="card-footer">
          <span className="price">${event.price}</span>
          <span className="pill-btn pill-secondary btn-sm">Get Ticket</span>
        </div>
      </div>
    </Link>
  );
};