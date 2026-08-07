'use client';

import { useEffect, useState } from 'react';
import { supabase, Producto } from '@/lib/supabase';
import { formatPrice } from '@/lib/formatPrice';
import { Package, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

interface InventoryData {
  totalValue: number;
  totalUnits: number;
  totalProducts: number;
  averageValuePerProduct: number;
  productsWithoutStock: number;
  topValueProducts: Array<{
    nombre: string;
    laboratorio: string;
    valor: number;
    stock: number;
  }>;
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
        averageValuePerProduct: 0,
        productsWithoutStock: 0,
        topValueProducts: [],
      });
      setLoading(false);
      return;
    }

    // Calcular estadísticas
    let totalValue = 0;
    let totalUnits = 0;
    let productsWithoutStock = 0;

    const productsWithValue = productos.map((p) => {
      const stock = p.stock ?? 0;
      const valor = p.precio * stock;

      totalValue += valor;
      totalUnits += stock;

      if (stock === 0) {
        productsWithoutStock += 1;
      }

      return {
        nombre: p.nombre,
        laboratorio: p.laboratorio,
        valor,
        stock,
      };
    });

    // Obtener top 5 productos con mayor valor
    const topValueProducts = productsWithValue
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);

    const averageValuePerProduct = productos.length > 0 ? totalValue / productos.length : 0;

    setStats({
      totalValue,
      totalUnits,
      totalProducts: productos.length,
      averageValuePerProduct,
      productsWithoutStock,
      topValueProducts,
    });

    setLoading(false);
  };

  if (loading || !stats) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Estadísticas Principales */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <Package size={24} className="text-brand-600" />
          <h2 className="text-xl font-bold text-gray-900">Valorización de Inventario</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Valor Total */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={18} className="text-green-600" />
              <p className="text-sm text-gray-600 font-semibold">Valor Total</p>
            </div>
            <p className="text-3xl font-bold text-green-600 break-words">
              ${formatPrice(stats.totalValue)}
            </p>
            <p className="text-xs text-gray-500 mt-2">Inventario valorizado</p>
          </div>

          {/* Total de Unidades */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Package size={18} className="text-blue-600" />
              <p className="text-sm text-gray-600 font-semibold">Unidades</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.totalUnits.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">Stock total</p>
          </div>

          {/* Total de Productos */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-purple-600" />
              <p className="text-sm text-gray-600 font-semibold">Productos</p>
            </div>
            <p className="text-3xl font-bold text-purple-600">{stats.totalProducts}</p>
            <p className="text-xs text-gray-500 mt-2">Catálogo activo</p>
          </div>

          {/* Sin Stock */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className="text-red-600" />
              <p className="text-sm text-gray-600 font-semibold">Sin Stock</p>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.productsWithoutStock}</p>
            <p className="text-xs text-gray-500 mt-2">Productos agotados</p>
          </div>
        </div>

        {/* Valor Promedio */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Valor Promedio por Producto</p>
          <p className="text-2xl font-bold text-gray-800">${formatPrice(stats.averageValuePerProduct)}</p>
        </div>
      </div>

      {/* Top Productos por Valor */}
      {stats.topValueProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top 5 Productos por Valor</h3>
          <div className="space-y-3">
            {stats.topValueProducts.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-brand-600 bg-brand-100 px-2.5 py-1 rounded-full">
                      #{idx + 1}
                    </span>
                    <p className="text-sm font-semibold text-gray-900 truncate">{product.nombre}</p>
                  </div>
                  <p className="text-xs text-gray-500">{product.laboratorio}</p>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900">${formatPrice(product.valor)}</p>
                  <p className="text-xs text-gray-500">{product.stock} unidades</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
