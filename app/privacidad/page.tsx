import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidad - INSUPEC',
  description: 'Política de privacidad de INSUPEC. Conocé cómo protegemos tus datos personales.',
};

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <Link href="/productos" className="text-brand-600 hover:underline flex items-center gap-2 mb-8 text-sm font-medium">
        <ArrowLeft size={18} />
        Volver al catálogo
      </Link>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Política de Privacidad</h1>
      <p className="text-sm text-gray-500 mb-8">INSUPEC — Insumos Pecuarios · Bv Lehmann 601, Rafaela, Santa Fe</p>

      <div className="space-y-8 text-gray-700 text-sm sm:text-base leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">1. Qué datos recopilamos</h2>
          <p>
            Cuando realizás un pedido te pedimos únicamente los datos necesarios para procesarlo:
            nombre y apellido, razón social, email, teléfono, dirección, ciudad y código postal.
            No solicitamos ni almacenamos datos de tarjetas ni información financiera.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">2. Para qué usamos tus datos</h2>
          <p>
            Usamos tus datos exclusivamente para gestionar tu pedido: confirmarlo por WhatsApp,
            coordinar el envío o retiro, y emitir la factura si la solicitás. No usamos tus datos
            para publicidad de terceros.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">3. Con quién compartimos tus datos</h2>
          <p>
            No vendemos ni compartimos tus datos personales con terceros. Solo se comparten con el
            transporte que elijas para el envío, y únicamente los datos necesarios para la entrega.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">4. Seguridad</h2>
          <p>
            Todo el sitio funciona sobre conexión cifrada HTTPS/SSL. Tus datos se almacenan en
            servidores seguros con acceso restringido. El pago se coordina de forma directa al
            confirmar el pedido: nunca te vamos a pedir datos bancarios por fuera de los canales
            oficiales.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">5. Estadísticas de uso</h2>
          <p>
            Registramos de forma anónima las páginas visitadas para entender qué productos
            interesan más y mejorar el sitio. Esta información no identifica a ninguna persona.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">6. Tus derechos</h2>
          <p>
            Podés pedirnos en cualquier momento ver, corregir o eliminar tus datos personales.
            Escribinos por WhatsApp y lo resolvemos a la brevedad.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2">7. Contacto</h2>
          <p>
            Ante cualquier duda sobre esta política, contactanos por WhatsApp o visitanos en
            Bv Lehmann 601, Rafaela, Santa Fe.
          </p>
        </section>
      </div>
    </div>
  );
}
