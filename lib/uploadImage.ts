import { supabase } from './supabase';

// Supabase Storage rechaza keys con acentos/ñ/caracteres especiales ("Invalid key").
// Los archivos que bajan de Canva, WhatsApp, etc. suelen venir con nombres en
// español ("Diseño sin título.png"), así que hay que limpiarlos antes de subir.
function sanitizeFileName(name: string): string {
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot).toLowerCase() : '';

  const combiningMarks = new RegExp('[̀-ͯ]', 'g');
  const safeBase = base
    .normalize('NFD')
    .replace(combiningMarks, '') // quita tildes y diéresis (é, ñ -> n, ü -> u, etc.)
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `${safeBase || 'imagen'}${ext}`;
}

export async function uploadImagenProducto(file: File): Promise<string> {
  const fileName = `${Date.now()}-${sanitizeFileName(file.name)}`;
  const { error } = await supabase.storage.from('productos').upload(fileName, file);

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from('productos').getPublicUrl(fileName);
  return data.publicUrl;
}
