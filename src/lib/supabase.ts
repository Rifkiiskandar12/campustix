import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Event = {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  date: string;
  venue: string;
  price: number;
  capacity: number;
  soldCount: number;
  organizerName: string;
};

export type Booking = {
  id: string;
  userId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  ticketType: string;
  quantity: number;
  totalPrice: number;
  ticketCode: string;
  createdAt: string;
};