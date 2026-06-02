import { useNavigate } from 'react-router-dom';
import './Support.css';

export const Support = () => {
  const navigate = useNavigate();

  return (
    <div className="page-enter-active support-layout">
      <button className="pill-btn pill-secondary btn-sm mb-6" onClick={() => navigate(-1)}>
        ← Kembali
      </button>

      <h2>Bantuan & Dukungan</h2>
      <p className="support-subtitle">Ada masalah dengan tiket atau akunmu? Kami siap membantu.</p>

      <div className="faq-section">
        <h3>Pertanyaan yang Sering Diajukan (FAQ)</h3>
        
        <div className="faq-item">
          <h4>Bagaimana cara menukarkan tiket saya di lokasi acara?</h4>
          <p>Tunjukkan kode tiket unik (contoh: CTX-A1B2C) yang ada di menu "My Tickets" kepada panitia di pintu masuk. Panitia akan memverifikasi kode tersebut.</p>
        </div>

        <div className="faq-item">
          <h4>Apakah saya bisa membatalkan tiket yang sudah dibeli?</h4>
          <p>Saat ini, semua pembelian bersifat final dan tidak dapat dikembalikan (non-refundable). Pastikan jadwal Anda kosong sebelum membeli tiket.</p>
        </div>

        <div className="faq-item">
          <h4>Apa yang terjadi jika acara dibatalkan?</h4>
          <p>Jika acara dibatalkan oleh penyelenggara, panitia akan menghubungi Anda melalui email untuk proses pengembalian dana atau penjadwalan ulang.</p>
        </div>
      </div>

      <div className="contact-section">
        <h3>Masih butuh bantuan?</h3>
        <p>Hubungi tim admin CampusTix melalui email di bawah ini:</p>
        <a href="mailto:jaaaa7126@gmail.com" className="pill-btn pill-primary full-width" style={{ textDecoration: 'none', textAlign: 'center' }}>
          Email Support
        </a>
      </div>
    </div>
  );
};