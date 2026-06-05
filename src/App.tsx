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
  const [userRole, setUserRole] = useState<'admin' | 'checker' | 'user'>('user'); 
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Pendeteksi error
    const fetchUserRole = async (userId: string) => {
      console.log("🔍 Mengecek role ke Supabase untuk ID:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      // JIKA DIBLOKIR ATAU ERROR, MUNCULKAN PESAN MERAH DI CONSOLE
      if (error) {
        console.error("❌ PESAN ERROR DARI SUPABASE:", error.message);
      }
      
      // JIKA BERHASIL, UBAH ROLE NYA
      if (data) {
        console.log("✅ Berhasil! Role di database adalah:", data.role);
        setUserRole(data.role);
      }
    };

    // Cek sesi aktif
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUserRole(session.user.id);
    });

    // Pantau login atau logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole('user'); // Reset ke user biasa jika logout
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Variabel penentu akses dinamis
  const isAdmin = userRole === 'admin';
  const isChecker = userRole === 'checker';
  const isStaff = isAdmin || isChecker;

  return (
    <>
      <Navbar user={user} isAdmin={isAdmin} isChecker={isChecker} />
      
      <main className="app-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login user={user} />} />
          <Route path="/event/:id" element={<EventDetail user={user} />} />
          
          {/* Auth-gated routes */} 
          <Route path="/tickets" element={user ? <MyTickets user={user} /> : <Navigate to="/" replace />} />
          <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/" replace />} />
          
          {/* Admin & Staff routes */}
          <Route path="/admin" element={isStaff ? <AdminDashboard isAdmin={isAdmin} /> : <Navigate to="/" replace />} />
          <Route path="/admin/add-event" element={isAdmin ? <AdminAddEvent user={user} /> : <Navigate to="/" replace />} />
          <Route path="/admin/edit-event/:id" element={isAdmin ? <AdminEditEvent /> : <Navigate to="/" replace />} />
          
          <Route path="/support" element={<Support />} />
        </Routes>
      </main>

      {error && <Toast message={error} onClose={() => setError(null)} />}
    </>
  );
}