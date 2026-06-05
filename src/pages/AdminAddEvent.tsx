import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import './AdminAddEvent.css';

export const AdminAddEvent = ({ user }: { user: User | null }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Music',
    date: '',
    venue: '',
    price: 0,
    capacity: 0,
    organizerName: user?.user_metadata?.full_name || 'Admin',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      alert("Harap pilih gambar poster terlebih dahulu!");
      return;
    }
    
    setLoading(true);

    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `posters/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-posters')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('event-posters')
        .getPublicUrl(filePath);

      const finalImageUrl = publicUrlData.publicUrl;

      const formattedDate = new Date(formData.date).toISOString();

      const { error: dbError } = await supabase.from('events').insert({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        imageUrl: finalImageUrl,
        date: formattedDate,
        venue: formData.venue,
        price: Number(formData.price),
        capacity: Number(formData.capacity),
        soldCount: 0,
        organizerName: formData.organizerName,
      });

      if (dbError) throw dbError;

      // Jika semua sukses, kembali ke halaman utama
      navigate('/'); 

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert('Terjadi kesalahan: ' + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter-active admin-layout">
      <h2>Tambah Event Baru</h2>
      <p className="admin-subtitle">Buat acara kampusmu dan mulai jual tiket sekarang.</p>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Judul Event</label>
          <input className="field-control" type="text" name="title" required value={formData.title} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Deskripsi Singkat</label>
          <textarea className="field-control" name="description" required rows={3} value={formData.description} onChange={handleChange} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Kategori</label>
            <select className="field-control" name="category" value={formData.category} onChange={handleChange}>
              <option value="Music">Music</option>
              <option value="Sports">Sports</option>
              <option value="Academic">Academic</option>
              <option value="Arts">Arts</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tanggal & Waktu</label>
            <input className="field-control" type="datetime-local" name="date" required value={formData.date} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Lokasi (Venue)</label>
            <input className="field-control" type="text" name="venue" required value={formData.venue} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Nama Penyelenggara</label>
            <input className="field-control" type="text" name="organizerName" required value={formData.organizerName} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Harga Tiket (Rp)</label>
            <input className="field-control" type="number" name="price" min="0" required value={formData.price} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Total Kuota (Kapasitas)</label>
            <input className="field-control" type="number" name="capacity" min="1" required value={formData.capacity} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label>Upload Gambar Poster</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            required 
            className="file-control"
          />
        </div>

        <button type="submit" className="pill-btn pill-primary full-width admin-submit" disabled={loading}>
          {loading ? 'Mengunggah & Menyimpan...' : 'Terbitkan Event'}
        </button>
      </form>
    </div>
  );
};
