import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './AdminAddEvent.css'; 

export const AdminEditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Music', date: '', venue: '', price: 0, capacity: 0, organizerName: '',
  });

  useEffect(() => {
    const fetchEvent = async () => {
      const { data } = await supabase.from('events').select('*').eq('id', id).single();
      if (data) {
        // Mengubah format ISO dari DB agar cocok dengan input datetime-local HTML
        const dateObj = new Date(data.date);
        const localDateTime = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        
        setFormData({
          title: data.title, description: data.description, category: data.category,
          date: localDateTime, venue: data.venue, price: data.price, capacity: data.capacity, organizerName: data.organizerName,
        });
        setCurrentImageUrl(data.imageUrl);
      }
    };
    fetchEvent();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = currentImageUrl; 

      // Jika admin mengunggah gambar baru
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `posters/${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from('event-posters').upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage.from('event-posters').getPublicUrl(filePath);
        finalImageUrl = publicUrlData.publicUrl;
      }

      // Update data di database
      const formattedDate = new Date(formData.date).toISOString();
      const { error: dbError } = await supabase.from('events').update({
        title: formData.title, description: formData.description, category: formData.category,
        imageUrl: finalImageUrl, date: formattedDate, venue: formData.venue,
        price: Number(formData.price), capacity: Number(formData.capacity), organizerName: formData.organizerName,
      }).eq('id', id);

      if (dbError) throw dbError;
      navigate('/admin'); 
    } catch (error: any) {
      alert('Terjadi kesalahan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter-active admin-layout">
      <h2>Edit Event</h2>
      
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Judul Event</label>
          <input type="text" name="title" required value={formData.title} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Deskripsi Singkat</label>
          <textarea name="description" required rows={3} value={formData.description} onChange={handleChange} />
        </div>

        <div className="form-row">
          <div className="form-group"><label>Kategori</label><select name="category" value={formData.category} onChange={handleChange}><option value="Music">Music</option><option value="Sports">Sports</option><option value="Academic">Academic</option><option value="Arts">Arts</option></select></div>
          <div className="form-group"><label>Tanggal & Waktu</label><input type="datetime-local" name="date" required value={formData.date} onChange={handleChange} /></div>
        </div>

        <div className="form-row">
          <div className="form-group"><label>Lokasi (Venue)</label><input type="text" name="venue" required value={formData.venue} onChange={handleChange} /></div>
          <div className="form-group"><label>Penyelenggara</label><input type="text" name="organizerName" required value={formData.organizerName} onChange={handleChange} /></div>
        </div>

        <div className="form-row">
          <div className="form-group"><label>Harga Tiket (Rp)</label><input type="number" name="price" min="0" required value={formData.price} onChange={handleChange} /></div>
          <div className="form-group"><label>Kapasitas</label><input type="number" name="capacity" min="1" required value={formData.capacity} onChange={handleChange} /></div>
        </div>

        <div className="form-group">
          <label>Ganti Poster (Opsional)</label>
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ padding: 'var(--space-2) 0', border: 'none' }} />
          <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', margin: 0 }}>Biarkan kosong jika tidak ingin mengubah gambar.</p>
        </div>

        <button type="submit" className="pill-btn pill-primary full-width" disabled={loading} style={{ marginTop: 'var(--space-4)' }}>
          {loading ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  );
};