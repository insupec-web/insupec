import { Producto } from '@/lib/supabase';
import { formatPrice, toTitleCase } from '@/lib/formatPrice';
import { formatMesAnio } from '@/lib/format';

// Formato 9:16 (1080x1920): estados de WhatsApp e historias de Instagram sin recorte.
// Zona segura: el contenido clave queda entre y=150 y y=1770; los bordes superior e inferior
// los tapan la barra de progreso y la respuesta de la app.
export const CARD_W = 1080;
export const CARD_H = 1920;

const C = {
  verde: '#48a828',
  verdeOscuro: '#1e4d12',
  verdeMedio: '#2d6b1a',
  oro: '#c6a15b',
  tinta: '#16200f',
  gris: '#6b7a66',
  suave: '#eef6e8',
  borde: '#dfe9d6',
  rojo: '#c2410c',
  ambar: '#b45309',
};
const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

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
  align: CanvasTextAlign = 'center',
  spacing = 0,
) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = `${spacing}px`;
  ctx.fillText(value, x, y);
  ctx.letterSpacing = '0px';
  ctx.textAlign = 'left';
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
  if (stock <= 0) return { texto: 'SIN STOCK', color: C.rojo };
  if (stock < 5) return { texto: `ÚLTIMAS ${stock} U.`, color: C.ambar };
  return { texto: `EN STOCK · ${stock} U.`, color: C.verdeMedio };
}

function textoVencimiento(vencimiento: string | null | undefined): string {
  return vencimiento ? `VTO. ${formatMesAnio(vencimiento)}` : 'VTO. A CONSULTAR';
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

  // Fondo degradado
  const fondo = ctx.createLinearGradient(0, 0, 0, CARD_H);
  fondo.addColorStop(0, '#ffffff');
  fondo.addColorStop(1, C.suave);
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  const cx = CARD_W / 2;

  // Logo arriba
  if (logo) {
    const lh = 150;
    const lw = (logo.naturalWidth / logo.naturalHeight) * lh;
    ctx.drawImage(logo, cx - lw / 2, 150, lw, lh);
  } else {
    texto(ctx, 'INSUPEC', cx, 225, `bold 120px ${FONT}`, C.verdeOscuro);
  }

  // Filete dorado + subtítulo
  ctx.fillStyle = C.oro;
  ctx.fillRect(cx - 130, 340, 260, 3);
  texto(ctx, 'CATÁLOGO DE PRODUCTOS', cx, 386, `600 27px ${FONT}`, C.gris, 'center', 6);

  // Tarjeta de foto
  ctx.save();
  ctx.shadowColor = 'rgba(30, 77, 18, 0.20)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 22;
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 70, 440, CARD_W - 140, 760, 44);
  ctx.fill();
  ctx.restore();

  if (foto) {
    dibujarContenida(ctx, foto, 120, 490, CARD_W - 240, 660);
  } else {
    texto(ctx, 'Sin foto', cx, 820, `500 40px ${FONT}`, C.gris);
  }

  // Laboratorio
  const laboratorio = (producto.laboratorio || '').toUpperCase();
  if (laboratorio) {
    const txt = truncar(ctx, laboratorio, 900);
    texto(ctx, txt, cx, 1262, `bold 34px ${FONT}`, C.verde, 'center', 4);
  }

  // Nombre (hasta 2 líneas centradas)
  ctx.font = `bold 66px ${FONT}`;
  const lineas = wrapLines(ctx, toTitleCase(producto.nombre), 940, 2);
  lineas.forEach((linea, i) => texto(ctx, linea, cx, 1342 + i * 74, `bold 66px ${FONT}`, C.tinta));

  // Bloque de precio
  const py = 1472;
  const phh = 168;
  const pg = ctx.createLinearGradient(0, py, 0, py + phh);
  pg.addColorStop(0, C.verdeMedio);
  pg.addColorStop(1, C.verdeOscuro);
  ctx.fillStyle = pg;
  roundRect(ctx, 130, py, CARD_W - 260, phh, 36);
  ctx.fill();
  ctx.strokeStyle = C.oro;
  ctx.lineWidth = 3;
  roundRect(ctx, 130, py, CARD_W - 260, phh, 36);
  ctx.stroke();
  texto(ctx, 'PRECIO', cx, py + 40, `bold 26px ${FONT}`, C.oro, 'center', 6);
  texto(ctx, `$ ${formatPrice(producto.precio)}`, cx, py + 114, `bold 100px ${FONT}`, '#ffffff');

  // Fila: stock + vencimiento (siempre visible)
  const yRow = 1676;
  const hRow = 86;
  const estado = estadoStock(producto.stock ?? 0);

  ctx.fillStyle = estado.color;
  roundRect(ctx, 130, yRow, 410, hRow, hRow / 2);
  ctx.fill();
  texto(ctx, estado.texto, 335, yRow + hRow / 2, `bold 32px ${FONT}`, '#ffffff');

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 560, yRow, 390, hRow, hRow / 2);
  ctx.fill();
  ctx.strokeStyle = C.oro;
  ctx.lineWidth = 3;
  roundRect(ctx, 560, yRow, 390, hRow, hRow / 2);
  ctx.stroke();
  texto(ctx, textoVencimiento(producto.vencimiento), 755, yRow + hRow / 2, `bold 32px ${FONT}`, C.verdeOscuro);

  // Pie
  const fy = 1778;
  const fg = ctx.createLinearGradient(0, fy, 0, CARD_H);
  fg.addColorStop(0, C.verdeMedio);
  fg.addColorStop(1, C.verdeOscuro);
  ctx.fillStyle = fg;
  ctx.fillRect(0, fy, CARD_W, CARD_H - fy);
  ctx.fillStyle = C.oro;
  ctx.fillRect(cx - 80, fy + 26, 160, 2);
  texto(ctx, 'Consultá disponibilidad y hacé tu pedido', cx, fy + 62, `bold 36px ${FONT}`, '#ffffff');
  texto(ctx, 'PEDIDOS ONLINE · INSUPEC', cx, fy + 110, `600 26px ${FONT}`, C.oro, 'center', 5);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar la imagen'))),
      'image/png',
    );
  });
}
