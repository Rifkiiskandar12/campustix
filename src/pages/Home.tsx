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
        <div className="hero-copy">
          <p className="hero-kicker">Live campus drop</p>
          <h1>Ticket Board</h1>
          <p className="page-subtitle">Katalog event kampus yang cepat dipindai: konser, seminar, pertandingan, dan acara seni dalam satu board.</p>
        </div>
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
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <div className="empty-state">
            <h2>Tidak ada event yang cocok</h2>
            <p>Coba kata kunci lain atau pilih kategori All.</p>
          </div>
        )}
      </main>
    </div>
  );
};
