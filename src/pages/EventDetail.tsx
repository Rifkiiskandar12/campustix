import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, type Event } from '../lib/supabase';
import './EventDetail.css';

export const EventDetail = ({ user }: { user: any }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [qty, setQty] = useState(1);
  const [ticketType, setTicketType] = useState('General');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getEvent = async () => {
      const { data } = await supabase.from('events').select('*').eq('id', id).single();
      setEvent(data);
    };
    getEvent();
  }, [id]);

  const handleBook = async () => {
    if (!user) return navigate('/login');
    if (!proofFile) return alert("Harap unggah bukti transfer terlebih dahulu!");
    
    setLoading(true);
    
    try {
      // 1. Upload Bukti Transfer
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, proofFile);
        
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      // 2. Simpan Booking dengan status 'pending'
      const ticketCode = `CTX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const { error: dbError } = await supabase.from('bookings').insert({
        userId: user.id,
        eventId: event?.id,
        eventTitle: event?.title,
        eventDate: event?.date,
        ticketType,
        quantity: qty,
        totalPrice: (event?.price || 0) * qty,
        ticketCode,
        status: 'pending', // Status awal
        paymentProofUrl: publicUrlData.publicUrl
      });

      if (dbError) throw dbError;
      
      alert("Pesanan berhasil dibuat! Menunggu verifikasi admin.");
      navigate('/tickets');
      
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

  return (
    <div className="page-enter-active split-studio">
      <div className="panel-left">
        <img src={event.imageUrl} alt={event.title} className="detail-hero-img" />
        <div className="detail-meta">
          <h2>{event.title}</h2>
          <p className="organizer">Oleh {event.organizerName}</p>
          <p className="desc">{event.description}</p>
        </div>
      </div>
      
      <div className="panel-right">
        <div className="booking-workbench">
          <h3>Beli Tiket</h3>
          
          <div className="seat-selector">
            {['General', 'VIP'].map(type => (
              <button 
                key={type}
                className={`ticket-type-card ${ticketType === type ? 'selected' : ''}`}
                onClick={() => setTicketType(type)}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="quantity-control">
            <label>Jumlah Tiket</label>
            <input type="number" min="1" max="5" value={qty} onChange={e => setQty(Number(e.target.value))} />
          </div>

          <div className="summary" style={{ borderBottom: '1px solid var(--color-rule)', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-4)' }}>
            <span>Total Bayar</span>
            <span className="price">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(event.price * qty)}
            </span>
          </div>

          {/* Area Pembayaran Manual */}
          <div className="manual-payment" style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <p style={{ fontSize: '0.9rem', marginBottom: 'var(--space-2)' }}>Scan QRIS / GoPay di bawah ini:</p>
            {/* GANTI URL DI BAWAH INI DENGAN GAMBAR QRIS ASLI ANDA */}
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GOPAY-NOMOR-ANDA" alt="QRIS" style={{ width: '150px', borderRadius: '8px', marginBottom: 'var(--space-4)' }} />
            
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Unggah Bukti Transfer</label>
              <input type="file" accept="image/*" onChange={(e) => setProofFile(e.target.files?.[0] || null)} style={{ width: '100%' }} />
            </div>
          </div>

          <button className="pill-btn pill-primary full-width" onClick={handleBook} disabled={loading || !proofFile}>
            {loading ? 'Memproses...' : 'Konfirmasi & Bayar'}
          </button>
        </div>
      </div>
    </div>
  );
};