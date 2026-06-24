'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingUp } from 'lucide-react';

interface TrafficData {
  totalVisits: number;
  visitsToday: number;
  visitsThisWeek: number;
  topPages: Array<{ page: string; count: number }>;
}

export default function TrafficStats() {
  const [stats, setStats] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data: allVisits } = await supabase
        .from('page_visits')
        .select('*');

      const { data: todayVisits } = await supabase
        .from('page_visits')
        .select('*')
        .gte('timestamp', today);

      const { data: weekVisits } = await supabase
        .from('page_visits')
        .select('*')
        .gte('timestamp', weekAgo);

      // Calcular páginas más visitadas
      const pageCount: Record<string, number> = {};
      allVisits?.forEach((visit) => {
        pageCount[visit.page] = (pageCount[visit.page] || 0) + 1;
      });

      const topPages = Object.entries(pageCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([page, count]) => ({ page, count }));

      setStats({
        totalVisits: allVisits?.length || 0,
        visitsToday: todayVisits?.length || 0,
        visitsThisWeek: weekVisits?.length || 0,
        topPages,
      });
    } catch (err) {
      console.error('Error fetching traffic stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={24} className="text-brand-600" />
        <h2 className="text-xl font-bold text-gray-900">Tráfico de la Web</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total de Visitas</p>
          <p className="text-3xl font-bold text-blue-600">{stats.totalVisits.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Visitas Hoy</p>
          <p className="text-3xl font-bold text-green-600">{stats.visitsToday}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Última Semana</p>
          <p className="text-3xl font-bold text-purple-600">{stats.visitsThisWeek}</p>
        </div>
      </div>

      {stats.topPages.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Páginas Más Visitadas</h3>
          <div className="space-y-2">
            {stats.topPages.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <span className="text-sm text-gray-700 truncate">{item.page || '/'}</span>
                <span className="text-sm font-bold text-brand-600">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
