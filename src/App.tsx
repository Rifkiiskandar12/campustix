import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { EventDetail } from './pages/EventDetail';
import { MyTickets } from './pages/MyTickets';
import { Profile } from './pages/Profile';
import { Toast } from './components/Toast';
import { Login } from './pages/login';
import { AdminAddEvent } from './pages/AdminAddEvent';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
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
      
      <main className="app-shell">
        <Routes>
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
          <Route 
            path="/admin/add-event" 
            element={user ? <AdminAddEvent user={user} /> : <Navigate to="/login" replace />} 
          />
        </Routes>
      </main>

      {error && <Toast message={error} onClose={() => setError(null)} />}
    </>
  );
}
