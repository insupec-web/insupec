import { supabase } from '@/lib/supabase';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://insupec.com.ar';

export async function GET() {
  try {
    const { data: productos, error } = await supabase
      .from('productos')
      .select('id, nombre, precio, foto_url, laboratorio, stock, vencimiento, categoria')
      .or('activo.is.null,activo.eq.true')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Filtrar productos vencidos
    const productosActivos = (productos || []).filter(p => !p.vencimiento || new Date(p.vencimiento) >= new Date());

    // Crear CSV con datos para Mercado Libre
    const headers = ['Nombre', 'Precio', 'URL', 'Imagen', 'Laboratorio', 'Stock', 'Categoría'];
    const rows = productosActivos.map(p => [
      `"${p.nombre.replace(/"/g, '""')}"`,
      p.precio,
      `${baseUrl}/productos/${p.id}`,
      p.foto_url || '',
      `"${p.laboratorio.replace(/"/g, '""')}"`,
      p.stock || 0,
      `"${(p.categoria || '').replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="insupec-productos-mercadolibre.csv"',
      },
    });
  } catch (error) {
    console.error('Error exporting productos:', error);
    return new Response(JSON.stringify({ error: 'Error al exportar productos' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
