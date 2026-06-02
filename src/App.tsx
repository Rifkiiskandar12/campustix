import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { EventDetail } from './pages/EventDetail';
import { MyTickets } from './pages/MyTickets';
import { Profile } from './pages/Profile';
import { Toast } from './components/Toast';
import { Login } from './pages/Login';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth events (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <Navbar user={user} />
      
      <main style={{ padding: 'var(--space-8) var(--space-4)', maxWidth: '1200px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Taruh di bawah Route Home */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login user={user} />} />
          <Route path="/event/:id" element={<EventDetail user={user} />} />
          
          {/* Auth-gated routes */}
          <Route 
            path="/tickets" 
            element={user ? <MyTickets user={user} /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/profile" 
            element={user ? <Profile user={user} /> : <Navigate to="/" replace />} 
          />
        </Routes>
      </main>

      {error && <Toast message={error} onClose={() => setError(null)} />}
    </>
  );
}