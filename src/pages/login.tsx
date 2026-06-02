import { Navigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { GitBranch, Mail, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './login.css';

export const Login = ({ user }: { user: User | null }) => {
  // Jika user sudah login, langsung arahkan ke Home
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider,
      options: {
        redirectTo: window.location.origin // Akan kembali ke http://localhost:5173
      }
    });
    
    if (error) {
      console.error(`Error login ${provider}:`, error.message);
    }
  };

  return (
    <div className="page-enter-active login-layout">
      <section className="login-intro">
        <p className="login-kicker">Student access</p>
        <h1>Masuk, pilih event, simpan tiket.</h1>
        <p>CampusTix menyimpan booking dan kode tiketmu setelah login OAuth.</p>
        <div className="login-note">
          <ShieldCheck size={18} aria-hidden="true" />
          Redirect aman melalui Supabase Auth.
        </div>
      </section>

      <section className="login-card" aria-label="Login options">
        <h2>Masuk ke CampusTix</h2>
        <p className="login-desc">Pakai akun yang paling nyaman untuk aktivitas kampusmu.</p>
        
        <div className="auth-buttons">
          <button 
            className="pill-btn pill-secondary full-width" 
            onClick={() => handleOAuthLogin('google')}
          >
            <Mail size={18} aria-hidden="true" />
            Lanjutkan dengan Google
          </button>
          
          <button 
            className="pill-btn pill-primary full-width" 
            onClick={() => handleOAuthLogin('github')}
          >
            <GitBranch size={18} aria-hidden="true" />
            Lanjutkan dengan GitHub
          </button>
        </div>
      </section>
    </div>
  );
};
