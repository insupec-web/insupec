import { Producto } from '@/lib/supabase';
import { formatPrice, toTitleCase } from '@/lib/formatPrice';
import { formatMesAnio } from '@/lib/format';

// Formato 9:16 (1080x1920): estados de WhatsApp e historias de Instagram sin recorte.
// Zona segura: el contenido clave queda entre y=200 y y=1760.
export const CARD_W = 1080;
export const CARD_H = 1920;

// Mismos valores que usa la web (globals.css y clases Tailwind de ProductCard / Header).
const C = {
  brand50: '#f0f9e9',
  brand100: '#e7f3dc',
  brand600: '#48a828',
  brand700: '#3c8c20',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray800: '#1f2937',
  gray900: '#111827',
  amber500: '#f59e0b',
  white: '#ffffff',
};
const FONT = 'Arial, Helvetica, sans-serif';
const M = 72; // margen lateral

// Carga una imagen con CORS. Si falla o tarda demasiado devuelve null:
// nunca se dibuja una imagen sin CORS porque contaminaría el canvas y toBlob() fallaría.
export function cargarImagen(src: string, timeoutMs = 8000): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timer = setTimeout(() => resolve(null), timeoutMs);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = src;
  });
}

function ellipsize(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  let t = text;
  while (t.length > 0 && ctx.measureText(`${t}…`).width > maxWidth) {
    t = t.slice(0, -1);
  }
  return `${t.trimEnd()}…`;
}

// Trunca solo si no entra: si el texto cabe, se devuelve tal cual.
function truncar(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  return ctx.measureText(text).width <= maxWidth ? text : ellipsize(ctx, text, maxWidth);
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth || !current) {
      current = test;
      continue;
    }
    lines.push(current);
    if (lines.length === maxLines) {
      lines[maxLines - 1] = ellipsize(ctx, current, maxWidth);
      return lines;
    }
    current = word;
  }

  if (current) {
    if (lines.length === maxLines) {
      lines[maxLines - 1] = ellipsize(ctx, lines[maxLines - 1], maxWidth);
    } else {
      lines.push(current);
    }
  }
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function texto(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  font: string,
  color: string,
  align: CanvasTextAlign = 'left',
) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
  ctx.textAlign = 'left';
}

// Pastilla redondeada con texto centrado. Devuelve su ancho.
function pastilla(
  ctx: CanvasRenderingContext2D,
  label: string,
  x: number,
  y: number,
  h: number,
  bg: string,
  fg: string,
  font: string,
  borde?: string,
): number {
  ctx.font = font;
  const w = ctx.measureText(label).width + 48;
  ctx.fillStyle = bg;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  if (borde) {
    ctx.strokeStyle = borde;
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, h / 2);
    ctx.stroke();
  }
  texto(ctx, label, x + w / 2, y + h / 2, font, fg, 'center');
  return w;
}

// Dibuja la imagen centrada dentro de un recuadro, sin deformarla.
function dibujarContenida(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const escala = Math.min(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * escala;
  const dh = img.naturalHeight * escala;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function textoVencimiento(vencimiento: string | null | undefined): string {
  return vencimiento ? `Vto: ${formatMesAnio(vencimiento)}` : 'Vto: a consultar';
}

// Renderiza la tarjeta vertical de un producto y devuelve un PNG.
export async function renderProductoCard(producto: Producto): Promise<Blob> {
  const [foto, logo] = await Promise.all([
    producto.foto_url ? cargarImagen(producto.foto_url) : Promise.resolve(null),
    cargarImagen('/logo.png'),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas no disponible en este navegador');

  const cx = CARD_W / 2;
  const anchoUtil = CARD_W - M * 2;

  // Fondo blanco
  ctx.fillStyle = C.white;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Header como el de la web: logo centrado y línea gris inferior
  if (logo) {
    const lh = 120;
    const lw = (logo.naturalWidth / logo.naturalHeight) * lh;
    ctx.drawImage(logo, cx - lw / 2, 60, lw, lh);
  } else {
    texto(ctx, 'INSUPEC', cx, 120, `bold 84px ${FONT}`, C.brand600, 'center');
  }
  ctx.fillStyle = C.gray200;
  ctx.fillRect(0, 220, CARD_W, 2);

  // Categoría (pastilla verde suave, como los chips de marca)
  const categoria = producto.categoria?.trim() || '';
  if (categoria) {
    pastilla(ctx, truncar(ctx, categoria, 600), M, 270, 56, C.brand100, C.brand700, `bold 28px ${FONT}`);
  }

  // Foto: tarjeta redondeada con el gradiente brand-50 → gray-50 del ProductCard
  const fy = 350;
  const fh = 860;
  const fondoFoto = ctx.createLinearGradient(M, fy, M + anchoUtil, fy + fh);
  fondoFoto.addColorStop(0, C.brand50);
  fondoFoto.addColorStop(1, C.gray50);
  ctx.fillStyle = fondoFoto;
  roundRect(ctx, M, fy, anchoUtil, fh, 24);
  ctx.fill();
  ctx.strokeStyle = C.gray200;
  ctx.lineWidth = 2;
  roundRect(ctx, M, fy, anchoUtil, fh, 24);
  ctx.stroke();

  if (foto) {
    dibujarContenida(ctx, foto, M + 48, fy + 48, anchoUtil - 96, fh - 96);
  } else {
    texto(ctx, 'Sin foto', cx, fy + fh / 2, `500 38px ${FONT}`, C.gray500, 'center');
  }

  // Laboratorio
  const laboratorio = (producto.laboratorio || '').trim();
  if (laboratorio) {
    texto(ctx, truncar(ctx, laboratorio, anchoUtil), M, 1262, `600 34px ${FONT}`, C.gray600);
  }

  // Nombre
  ctx.font = `bold 62px ${FONT}`;
  const lineas = wrapLines(ctx, toTitleCase(producto.nombre), anchoUtil, 2);
  lineas.forEach((linea, i) => texto(ctx, linea, M, 1340 + i * 72, `bold 62px ${FONT}`, C.gray900));

  // Precio, en verde de marca y muy bold
  texto(ctx, `$${formatPrice(producto.precio)}`, M, 1530, `800 120px ${FONT}`, C.brand600);

  // Stock + vencimiento
  const stock = producto.stock ?? 0;
  const yMeta = 1672;
  const hMeta = 58;
  if (stock <= 0) {
    pastilla(ctx, 'AGOTADO', M, yMeta, hMeta, C.gray800, C.white, `bold 28px ${FONT}`);
  } else if (stock < 5) {
    pastilla(ctx, `ÚLTIMAS ${stock} U.`, M, yMeta, hMeta, C.amber500, C.white, `bold 28px ${FONT}`);
  } else {
    pastilla(ctx, `${stock} u. disponibles`, M, yMeta, hMeta, C.brand100, C.brand700, `bold 28px ${FONT}`);
  }

  const vto = textoVencimiento(producto.vencimiento);
  ctx.font = `bold 28px ${FONT}`;
  const anchoVto = ctx.measureText(vto).width + 48;
  pastilla(ctx, vto, CARD_W - M - anchoVto, yMeta, hMeta, C.gray100, C.gray800, `bold 28px ${FONT}`, C.gray200);

  // Pie: botón de marca, igual que los CTA de la web
  ctx.fillStyle = C.gray200;
  ctx.fillRect(0, 1790, CARD_W, 2);
  ctx.fillStyle = C.brand600;
  roundRect(ctx, M, 1812, anchoUtil, 80, 12);
  ctx.fill();
  texto(ctx, 'Hacé tu pedido online', cx, 1852, `bold 36px ${FONT}`, C.white, 'center');
  texto(ctx, 'INSUPEC · Insumos pecuarios', cx, 1884 + 22, `600 26px ${FONT}`, C.gray500, 'center');

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar la imagen'))),
      'image/png',
    );
  });
}
