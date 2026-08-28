import { CartItem } from './supabase';
import { formatPrice } from '@/lib/formatPrice';

interface ClientData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  factura: boolean;
  metodoPago?: 'efectivo' | 'transferencia' | 'echeq_30' | 'echeq_60' | 'echeq_90';
  transporte?: 'envio' | 'retiro';
}

const METODO_PAGO_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia Bancaria (Alias: HORA.COCTEL.CETRO)',
  echeq_30: 'Cheque / e-Cheq a 30 días',
  echeq_60: 'Cheque / e-Cheq a 60 días',
  echeq_90: 'Cheque / e-Cheq a 90 días',
};

export function generateWhatsAppMessage(
  clientData: ClientData,
  items: CartItem[],
  total: number,
  descuentoMonto?: number,
  descuentoPorcentaje?: number,
  ivaMonto?: number
): string {
  const factura = clientData.factura ? 'Sí' : 'No';
  const metodoPago = METODO_PAGO_LABELS[clientData.metodoPago || 'efectivo'] || 'Efectivo';

  const transporteText = clientData.transporte === 'retiro'
    ? 'Retira en Casa Central'
    : 'Mandar por transporte';

  const productosList = items
    .map((item) => `• ${item.nombre} - Cantidad: ${item.cantidad} - $${formatPrice(item.precio)}`)
    .join('\n');

  const descuentoText = descuentoMonto || descuentoPorcentaje
    ? `\n*DESCUENTO:* ${descuentoPorcentaje ? `${descuentoPorcentaje}%` : ''} (-$${formatPrice(descuentoMonto || 0)})`
    : '';

  const ivaText = ivaMonto && ivaMonto > 0
    ? `\n*IVA (21%):* +$${formatPrice(ivaMonto)}`
    : '';

  const totalFinal = total - (descuentoMonto || 0) + (ivaMonto || 0);

  const message = `
*PEDIDO INSUPEC*

*DATOS DEL CLIENTE:*
Nombre: ${clientData.nombre} ${clientData.apellido}
Email: ${clientData.email}
Teléfono: ${clientData.telefono}
Dirección: ${clientData.direccion}
Ciudad: ${clientData.ciudad}
Código Postal: ${clientData.codigoPostal}

*ENVÍO:*
${transporteText}

*PRODUCTOS:*
${productosList}

*SUBTOTAL:* $${formatPrice(total)}${descuentoText}${ivaText}

*TOTAL A PAGAR:* $${formatPrice(totalFinal)}

*MÉTODO DE PAGO:* ${metodoPago}
*¿NECESITA FACTURA?:* ${factura}

---
Pedido realizado desde la plataforma online.
  `.trim();

  return message;
}

export function getWhatsAppLink(message: string): string {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5493492615886';
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

