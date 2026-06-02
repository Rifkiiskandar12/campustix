import { useState, useEffect } from 'react';
import { supabase, type Event } from '../lib/supabase';
import { EventCard } from '../components/EventCard';
import './Home.css';

export const Home = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase.from('events').select('*');
      if (data) setEvents(data);
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || e.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page-enter-active home-layout">
      <header className="hero">
        <h1 style={{ fontSize: 'var(--text-display)', fontWeight: 800 }}>Campus Beat</h1>
        <div className="filters">
          <input 
            type="text" 
            placeholder="Search events..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <div className="chips">
            {['All', 'Music', 'Sports', 'Academic', 'Arts'].map(cat => (
              <button 
                key={cat}
                className={`pill-btn ${category === cat ? 'pill-primary' : 'pill-secondary'}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="event-grid">
        {filteredEvents.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </main>
    </div>
  );
};