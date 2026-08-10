import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const { data: productos, error } = await supabase
      .from('productos')
      .select('*')
      .order('laboratorio', { ascending: true })
      .order('nombre', { ascending: true });

    if (error) {
      throw error;
    }

    const excelData = (productos || []).map((p) => ({
      Laboratorio: p.laboratorio || '',
      Nombre: p.nombre,
      Precio: p.precio,
      Stock: p.stock ?? 0,
      Vencimiento: p.vencimiento || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

    // Configurar estilos y formato de columnas
    const columnWidths = [20, 30, 12, 10, 15];
    worksheet['!cols'] = columnWidths.map((width) => ({ wch: width }));

    // Agregar autofilter
    worksheet['!autofilter'] = { ref: `A1:E${excelData.length + 1}` };

    // Crear buffer
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Productos_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error exporting productos:', error);
    return NextResponse.json({ error: 'Error al exportar productos' }, { status: 500 });
  }
}
