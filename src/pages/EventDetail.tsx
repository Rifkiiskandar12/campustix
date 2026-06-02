import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { supabase, type Event } from '../lib/supabase';
import './EventDetail.css';

export const EventDetail = ({ user }: { user: User | null }) => {
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
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert("Error: " + message);
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

  const eventDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(event.date));
  const total = event.price * qty;
  const remaining = Math.max(event.capacity - event.soldCount, 0);

  return (
    <div className="page-enter-active split-studio">
      <div className="panel-left">
        <figure className="poster-frame">
          <img src={event.imageUrl} alt={event.title} className="detail-hero-img" />
          <figcaption>{event.category}</figcaption>
        </figure>
        <div className="detail-meta">
          <div className="detail-topline">
            <span>{eventDate}</span>
            <span>{event.venue}</span>
          </div>
          <h2>{event.title}</h2>
          <p className="organizer">Oleh {event.organizerName}</p>
          <p className="desc">{event.description}</p>
          <div className="event-stats">
            <span><strong>{remaining}</strong> slot tersisa</span>
            <span><strong>{event.soldCount}</strong> terjual</span>
            <span><strong>{event.capacity}</strong> kapasitas</span>
          </div>
        </div>
      </div>
      
      <div className="panel-right">
        <div className="booking-workbench">
          <div className="booking-header">
            <p>Checkout board</p>
            <h3>Beli Tiket</h3>
          </div>
          
          <div className="seat-selector">
            {['General', 'VIP'].map(type => (
              <button 
                key={type}
                className={`ticket-type-card ${ticketType === type ? 'selected' : ''}`}
                onClick={() => setTicketType(type)}
                aria-pressed={ticketType === type}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="quantity-control">
            <label>Jumlah Tiket</label>
            <input
              className="field-control"
              type="number"
              min="1"
              max="5"
              value={qty}
              onChange={e => setQty(Math.max(1, Number(e.target.value)))}
            />
          </div>

          <div className="summary">
            <span>Total Bayar</span>
            <span className="price">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(total)}
            </span>
          </div>

          <div className="manual-payment">
            <div className="qris-panel">
              <p>Scan QRIS / GoPay</p>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GOPAY-NOMOR-ANDA" alt="QRIS" />
            </div>
            
            <div className="upload-section">
              <label>Unggah Bukti Transfer (PNG/JPG)</label>
              <input type="file" accept="image/*" onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
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
