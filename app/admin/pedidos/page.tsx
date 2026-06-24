'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import AdminNav from '@/components/AdminNav';
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute';
import { Search, Check, X } from 'lucide-react';

interface Pedido {
  id: string;
  nombre: string;
  apellido: string;
  razon_social: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  codigo_postal: string;
  metodo_pago: 'efectivo' | 'transferencia';
  transporte: string;
  productos: Array<{id: string; nombre: string; cantidad: number; precio: number}>;
  total: number;
  confirmado: boolean;
  timestamp: string;
  factura: boolean;
}

function PedidosContent() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filterConfirmado, setFilterConfirmado] = useState<'todos' | 'confirmados' | 'pendientes'>('todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPedidos = async () => {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (err) {
      console.error('Error fetching pedidos:', err);
      setError('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  const pedidosFiltrados = useMemo(() => {
    let filtered = pedidos;

    // Filtro por búsqueda
    const q = query.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.apellido.toLowerCase().includes(q) ||
          p.razon_social.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.telefono.includes(q)
      );
    }

    // Filtro por estado
    if (filterConfirmado === 'confirmados') {
      filtered = filtered.filter((p) => p.confirmado);
    } else if (filterConfirmado === 'pendientes') {
      filtered = filtered.filter((p) => !p.confirmado);
    }

    return filtered;
  }, [pedidos, query, filterConfirmado]);

  const handleConfirmar = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ confirmado: !currentState })
        .eq('id', id);

      if (error) throw error;

      if (!currentState) {
        // Si se está confirmando, restar stock de los productos
        const pedido = pedidos.find((p) => p.id === id);
        if (pedido) {
          for (const producto of pedido.productos) {
            const { data: prod } = await supabase
              .from('productos')
              .select('cantidad')
              .eq('id', producto.id)
              .single();

            if (prod) {
              const nuevaCantidad = (prod.cantidad || 0) - producto.cantidad;
              await supabase
                .from('productos')
                .update({ cantidad: Math.max(0, nuevaCantidad) })
                .eq('id', producto.id);
            }
          }
        }
      }

      fetchPedidos();
    } catch (err) {
      console.error('Error updating pedido:', err);
      alert('Error al actualizar el pedido');
    }
  };

  const handleCancelar = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchPedidos();
    } catch (err) {
      console.error('Error canceling pedido:', err);
      alert('Error al cancelar el pedido');
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de Pedidos</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Búsqueda y Filtros */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
          <div className="space-y-4">
            {/* Buscador */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, email, teléfono..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Filtro de Estado */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterConfirmado('todos')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  filterConfirmado === 'todos'
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Todos ({pedidos.length})
              </button>
              <button
                onClick={() => setFilterConfirmado('pendientes')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  filterConfirmado === 'pendientes'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Pendientes ({pedidos.filter((p) => !p.confirmado).length})
              </button>
              <button
                onClick={() => setFilterConfirmado('confirmados')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  filterConfirmado === 'confirmados'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Confirmados ({pedidos.filter((p) => p.confirmado).length})
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Pedidos */}
        {pedidosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No hay pedidos que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidosFiltrados.map((pedido) => (
              <div
                key={pedido.id}
                className={`bg-white rounded-lg shadow transition-colors ${
                  pedido.confirmado ? 'border-l-4 border-green-500' : 'border-l-4 border-yellow-500'
                }`}
              >
                <div className="p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {pedido.nombre} {pedido.apellido}
                      </h3>
                      <p className="text-sm text-gray-600">{pedido.razon_social}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(pedido.timestamp).toLocaleDateString('es-AR')} {new Date(pedido.timestamp).toLocaleTimeString('es-AR')}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-brand-600">${pedido.total.toFixed(2)}</p>
                      {pedido.confirmado ? (
                        <button
                          disabled
                          className="mt-3 px-4 py-2 rounded-lg font-semibold text-white text-sm flex items-center gap-2 bg-green-600"
                        >
                          <Check size={16} /> Confirmado
                        </button>
                      ) : (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleConfirmar(pedido.id, pedido.confirmado)}
                            className="flex-1 px-3 py-2 rounded-lg font-semibold text-white text-sm bg-green-600 hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <Check size={16} /> Confirmar
                          </button>
                          <button
                            onClick={() => handleCancelar(pedido.id)}
                            className="flex-1 px-3 py-2 rounded-lg font-semibold text-white text-sm bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <X size={16} /> Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Toggle para expandir detalles */}
                  <button
                    onClick={() => setExpandedId(expandedId === pedido.id ? null : pedido.id)}
                    className="text-sm text-brand-600 hover:underline mb-4"
                  >
                    {expandedId === pedido.id ? '▼ Ocultar detalles' : '▶ Ver detalles'}
                  </button>

                  {expandedId === pedido.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                      {/* Contacto */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-semibold text-gray-900">{pedido.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Teléfono</p>
                          <p className="font-semibold text-gray-900">{pedido.telefono}</p>
                        </div>
                      </div>

                      {/* Envío */}
                      <div>
                        <p className="text-sm text-gray-600">Dirección</p>
                        <p className="font-semibold text-gray-900">
                          {pedido.direccion}, {pedido.ciudad} ({pedido.codigo_postal})
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Transporte</p>
                          <p className="font-semibold text-gray-900">{pedido.transporte}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Método de Pago</p>
                          <p className="font-semibold text-gray-900">
                            {pedido.metodo_pago === 'transferencia'
                              ? 'Transferencia (HORA.COCTEL.CETRO)'
                              : 'Efectivo'}
                          </p>
                        </div>
                      </div>

                      {pedido.factura && (
                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                          <p className="text-sm text-blue-700 font-semibold">✓ Requiere factura</p>
                        </div>
                      )}

                      {/* Productos */}
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-2">Productos:</p>
                        <div className="space-y-2">
                          {pedido.productos.map((prod, idx) => (
                            <div key={idx} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                              <div>
                                <p className="font-semibold text-gray-900">{prod.nombre}</p>
                                <p className="text-gray-600">x{prod.cantidad}</p>
                              </div>
                              <p className="font-semibold text-gray-900">${(prod.precio * prod.cantidad).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PedidosPage() {
  return (
    <ProtectedAdminRoute>
      <PedidosContent />
    </ProtectedAdminRoute>
  );
}
