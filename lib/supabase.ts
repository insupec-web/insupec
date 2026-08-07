import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || 'https://example123.supabase.co';
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()) || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  stock?: number;
  imagen_url?: string;
  laboratorio: string;
  created_at: string;
  updated_at: string;
  descripcion?: string;
  categoria?: string;
  presentacion?: string;
  activo?: boolean;
  puntos?: number;
  slug?: string;
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
  imagen_url?: string;
  moneda?: string;
}

export interface Pack {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagen_url?: string;
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
