import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Login.css';

export const Login = ({ user }: { user: any }) => {
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
      <div className="login-card">
        <h2>Masuk ke CampusTix</h2>
        <p className="login-desc">Satu akun untuk semua event kampusmu.</p>
        
        <div className="auth-buttons">
          <button 
            className="pill-btn pill-secondary full-width" 
            onClick={() => handleOAuthLogin('google')}
          >
            Lanjutkan dengan Google
          </button>
          
          <button 
            className="pill-btn pill-primary full-width" 
            onClick={() => handleOAuthLogin('github')}
          >
            Lanjutkan dengan GitHub
          </button>
        </div>
      </div>
    </div>
  );
};