'use client';

import { useEffect, useState } from 'react';
import { supabase, Producto } from '@/lib/supabase';
import { formatPrice } from '@/lib/formatPrice';
import { Package, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

interface InventoryData {
  totalValue: number;
  totalUnits: number;
  totalProducts: number;
  productsWithoutStock: number;
}

export default function InventoryStats({ productos }: { productos: Producto[] }) {
  const [stats, setStats] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateStats();
  }, [productos]);

  const calculateStats = () => {
    if (productos.length === 0) {
      setStats({
        totalValue: 0,
        totalUnits: 0,
        totalProducts: 0,
        productsWithoutStock: 0,
      });
      setLoading(false);
      return;
    }

    // Calcular estadísticas
    let totalValue = 0;
    let totalUnits = 0;
    let productsWithoutStock = 0;

    productos.forEach((p) => {
      const stock = p.stock ?? 0;
      totalValue += p.precio * stock;
      totalUnits += stock;

      if (stock === 0) {
        productsWithoutStock += 1;
      }
    });

    setStats({
      totalValue,
      totalUnits,
      totalProducts: productos.length,
      productsWithoutStock,
    });

    setLoading(false);
  };

  if (loading || !stats) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Estadísticas Principales */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-4">
          <Package size={24} className="text-brand-600" />
          <h2 className="text-xl font-bold text-gray-900">Valorización de Inventario</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Valor Total */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={18} className="text-green-600" />
              <p className="text-sm text-gray-600 font-semibold">Valor Total</p>
            </div>
            <p className="text-3xl font-bold text-green-600 break-words">
              ${formatPrice(stats.totalValue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Inventario valorizado</p>
          </div>

          {/* Total de Unidades */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Package size={18} className="text-blue-600" />
              <p className="text-sm text-gray-600 font-semibold">Unidades</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.totalUnits.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Stock total</p>
          </div>

          {/* Total de Productos */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={18} className="text-purple-600" />
              <p className="text-sm text-gray-600 font-semibold">Productos</p>
            </div>
            <p className="text-3xl font-bold text-purple-600">{stats.totalProducts}</p>
            <p className="text-xs text-gray-500 mt-1">Catálogo activo</p>
          </div>

          {/* Sin Stock */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-3 border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={18} className="text-red-600" />
              <p className="text-sm text-gray-600 font-semibold">Sin Stock</p>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.productsWithoutStock}</p>
            <p className="text-xs text-gray-500 mt-1">Productos agotados</p>
          </div>
        </div>
      </div>
    </div>
  );
}
