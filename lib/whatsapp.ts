import { CartItem } from './supabase';

interface ClientData {
  nombre: string;
  apellido: string;
  razonSocial: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  factura: boolean;
}

export function generateWhatsAppMessage(
  clientData: ClientData,
  items: CartItem[],
  total: number
): string {
  const factura = clientData.factura ? 'Sí' : 'No';

  const productosList = items
    .map((item) => `• ${item.nombre} - Cantidad: ${item.cantidad} - $${item.precio.toFixed(2)}`)
    .join('\n');

  const message = `
*PEDIDO INSUPEC*

*DATOS DEL CLIENTE:*
Nombre: ${clientData.nombre} ${clientData.apellido}
Razón Social: ${clientData.razonSocial}
Email: ${clientData.email}
Teléfono: ${clientData.telefono}
Dirección: ${clientData.direccion}
Ciudad: ${clientData.ciudad}
Código Postal: ${clientData.codigoPostal}

*PRODUCTOS:*
${productosList}

*SUBTOTAL:* $${total.toFixed(2)}
*¿NECESITA FACTURA?:* ${factura}

---
Pedido realizado desde la plataforma online.
  `.trim();

  return message;
}

export function getWhatsAppLink(message: string, phoneNumber: string = '5493492615886'): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}
