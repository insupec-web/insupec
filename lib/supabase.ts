import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || 'https://example123.supabase.co';
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()) || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  stock?: number;
  cantidad?: number;
  vencimiento: string;
  foto_url: string;
  laboratorio: string;
  created_at: string;
}

export interface Pedido {
  id: string;
  nombre: string;
  apellido: string;
  razon_social: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  codigo_postal: string;
  factura: boolean;
  productos: { id: string; nombre: string; cantidad: number; precio: number }[];
  total: number;
  timestamp: string;
}

export interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  foto_url: string;
}

export interface Pack {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  foto_url?: string;
  created_at: string;
}

export interface PackItem {
  id: string;
  pack_id: string;
  producto_id: string;
  cantidad: number;
  created_at: string;
  producto?: Producto;
}
