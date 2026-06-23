// Formatea una fecha de vencimiento (YYYY-MM-DD o YYYY-MM) como MM/AAAA.
export function formatMesAnio(value: string | null | undefined): string {
  if (!value) return '';
  const m = String(value).match(/^(\d{4})-(\d{2})/);
  if (m) return `${m[2]}/${m[1]}`;
  // Fallback: intentar parsear como fecha.
  const d = new Date(value);
  if (!isNaN(d.getTime())) {
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    return `${mes}/${d.getFullYear()}`;
  }
  return String(value);
}

// Convierte un valor de <input type="month"> (YYYY-MM) a fecha de DB (YYYY-MM-01).
export function mesAnioADate(value: string): string {
  if (!value) return '';
  return /^\d{4}-\d{2}$/.test(value) ? `${value}-01` : value;
}

// Convierte una fecha de DB (YYYY-MM-DD) a valor de <input type="month"> (YYYY-MM).
export function dateAMesAnio(value: string | null | undefined): string {
  if (!value) return '';
  const m = String(value).match(/^(\d{4}-\d{2})/);
  return m ? m[1] : '';
}
