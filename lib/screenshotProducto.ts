import { Producto } from '@/lib/supabase';
import { formatPrice, toTitleCase } from '@/lib/formatPrice';
import { formatMesAnio } from '@/lib/format';

// Formato vertical 4:5 (1080x1350): pensado para compartir en WhatsApp / Instagram.
export const CARD_W = 1080;
export const CARD_H = 1350;

const BRAND = '#48a828';
const BRAND_700 = '#3c8c20';
const BRAND_50 = '#f2f9ec';
const INK = '#1f2937';
const MUTED = '#6b7280';
const FOOTER_BG = '#f3f4f6';
const RED = '#dc2626';
const AMBER = '#d97706';
const FONT = 'Arial, Helvetica, sans-serif';

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
      // Quedan palabras sin mostrar: la última línea termina en "…".
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

function estadoStock(stock: number): { texto: string; color: string } {
  if (stock <= 0) return { texto: 'SIN STOCK', color: RED };
  if (stock < 5) return { texto: `ÚLTIMAS ${stock} U.`, color: AMBER };
  return { texto: `EN STOCK · ${stock} U.`, color: BRAND_700 };
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

  // Fondo
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Encabezado
  ctx.fillStyle = BRAND;
  ctx.fillRect(0, 0, CARD_W, 140);
  if (logo) {
    const lh = 80;
    const lw = (logo.naturalWidth / logo.naturalHeight) * lh;
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 50, 30, lw + 32, lh + 20, 16);
    ctx.fill();
    ctx.drawImage(logo, 66, 40, lw, lh);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 60px ${FONT}`;
    ctx.textBaseline = 'middle';
    ctx.fillText('INSUPEC', 60, 70);
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold 28px ${FONT}`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('PEDIDOS ONLINE', CARD_W - 50, 70);
  ctx.textAlign = 'left';

  // Laboratorio + categoría
  const laboratorio = (producto.laboratorio || '').toUpperCase();
  const categoria = producto.categoria?.trim() || '';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = BRAND_700;
  ctx.font = `bold 32px ${FONT}`;
  if (laboratorio) ctx.fillText(truncar(ctx, laboratorio, 620), 60, 215);
  if (categoria) {
    ctx.fillStyle = MUTED;
    ctx.font = `28px ${FONT}`;
    ctx.textAlign = 'right';
    ctx.fillText(truncar(ctx, categoria, 380), CARD_W - 60, 215);
    ctx.textAlign = 'left';
  }

  // Recuadro de foto
  const fx = 60, fy = 240, fw = CARD_W - 120, fh = 540;
  ctx.fillStyle = BRAND_50;
  roundRect(ctx, fx, fy, fw, fh, 28);
  ctx.fill();
  if (foto) {
    dibujarContenida(ctx, foto, fx + 30, fy + 30, fw - 60, fh - 60);
  } else {
    ctx.fillStyle = MUTED;
    ctx.font = `34px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Sin foto', fx + fw / 2, fy + fh / 2);
    ctx.textAlign = 'left';
  }

  // Nombre
  ctx.fillStyle = INK;
  ctx.font = `bold 56px ${FONT}`;
  ctx.textBaseline = 'alphabetic';
  const lineas = wrapLines(ctx, toTitleCase(producto.nombre), CARD_W - 120, 2);
  lineas.forEach((linea, i) => ctx.fillText(linea, 60, 845 + i * 68));

  // Separador
  const yDiv = 1000;
  ctx.fillStyle = '#e5e7eb';
  ctx.fillRect(60, yDiv, CARD_W - 120, 2);

  // Precio
  ctx.fillStyle = MUTED;
  ctx.font = `bold 26px ${FONT}`;
  ctx.fillText('PRECIO', 60, yDiv + 50);
  ctx.fillStyle = BRAND_700;
  ctx.font = `bold 124px ${FONT}`;
  ctx.fillText(`$ ${formatPrice(producto.precio)}`, 56, yDiv + 150);

  // Stock + vencimiento
  const stock = producto.stock ?? 0;
  const estado = estadoStock(stock);
  ctx.font = `bold 30px ${FONT}`;
  const anchoPill = ctx.measureText(estado.texto).width + 56;
  const yPill = 1176;
  ctx.fillStyle = estado.color;
  roundRect(ctx, 60, yPill, anchoPill, 60, 30);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.fillText(estado.texto, 88, yPill + 30);

  if (producto.vencimiento) {
    ctx.fillStyle = MUTED;
    ctx.font = `bold 30px ${FONT}`;
    ctx.textAlign = 'right';
    ctx.fillText(`Vto. ${formatMesAnio(producto.vencimiento)}`, CARD_W - 60, yPill + 30);
    ctx.textAlign = 'left';
  }

  // Pie
  ctx.fillStyle = FOOTER_BG;
  ctx.fillRect(0, CARD_H - 100, CARD_W, 100);
  ctx.fillStyle = INK;
  ctx.font = `30px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Consultá disponibilidad y hacé tu pedido · INSUPEC', CARD_W / 2, CARD_H - 50);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar la imagen'))),
      'image/png',
    );
  });
}
