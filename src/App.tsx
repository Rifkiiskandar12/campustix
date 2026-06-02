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
import { Support } from './pages/Support';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminEditEvent } from './pages/AdminEditEvent';

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

  
    const adminEmails = ['jaaaa7126@gmail.com'];
    const isAdmin = user && adminEmails.includes(user?.email);

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
            path="/admin" 
            element={isAdmin ? <AdminDashboard /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/admin/add-event" 
            element={isAdmin ? <AdminAddEvent user={user} /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/admin/edit-event/:id" 
            element={isAdmin ? <AdminEditEvent /> : <Navigate to="/" replace />} 
          />
          <Route path="/support" element={<Support />} />
        </Routes>
      </main>

      {error && <Toast message={error} onClose={() => setError(null)} />}
    </>
  );
}
