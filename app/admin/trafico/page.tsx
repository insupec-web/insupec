'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AdminNav from '@/components/AdminNav';
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute';
import { TrendingUp, Eye, CalendarDays, CalendarRange } from 'lucide-react';

interface Visita {
  page: string;
  referrer: string | null;
  created_at: string;
}

const DIAS_HISTORIAL = 14;
const LIMITE_FILAS = 8000;

function TraficoContent() {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [totalGeneral, setTotalGeneral] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatos = async () => {
      const { count } = await supabase.from('page_visits').select('*', { count: 'exact', head: true });
      setTotalGeneral(count ?? 0);

      const { data } = await supabase
        .from('page_visits')
        .select('page, referrer, created_at')
        .order('created_at', { ascending: false })
        .limit(LIMITE_FILAS);

      setVisitas(data || []);
      setLoading(false);
    };

    fetchDatos();
  }, []);

  const stats = useMemo(() => {
    const ahora = new Date();
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const inicioSemana = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);

    let hoy = 0;
    let semana = 0;
    const porPagina: Record<string, number> = {};
    const porReferrer: Record<string, number> = {};
    const porDia: Record<string, number> = {};

    visitas.forEach((v) => {
      const fecha = new Date(v.created_at);
      if (fecha >= inicioHoy) hoy++;
      if (fecha >= inicioSemana) semana++;

      const pagina = v.page || '/';
      porPagina[pagina] = (porPagina[pagina] || 0) + 1;

      let origen = 'Directo';
      if (v.referrer) {
        try {
          origen = new URL(v.referrer).hostname.replace('www.', '');
        } catch {
          origen = v.referrer;
        }
      }
      porReferrer[origen] = (porReferrer[origen] || 0) + 1;

      const dia = fecha.toISOString().slice(0, 10);
      porDia[dia] = (porDia[dia] || 0) + 1;
    });

    const topPaginas = Object.entries(porPagina).sort(([, a], [, b]) => b - a).slice(0, 8);
    const topReferrers = Object.entries(porReferrer).sort(([, a], [, b]) => b - a).slice(0, 6);

    const dias: { fecha: string; visitas: number }[] = [];
    for (let i = DIAS_HISTORIAL - 1; i >= 0; i--) {
      const d = new Date(inicioHoy.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dias.push({ fecha: key, visitas: porDia[key] || 0 });
    }

    return { hoy, semana, topPaginas, topReferrers, dias };
  }, [visitas]);

  const maxDia = Math.max(1, ...stats.dias.map((d) => d.visitas));

  if (loading) {
    return (
      <>
        <AdminNav />
        <div className="max-w-5xl mx-auto px-4 pt-24 text-center text-gray-600">Cargando tráfico...</div>
      </>
    );
  }

  return (
    <>
      <AdminNav />
      <div className="max-w-5xl mx-auto px-3 sm:px-4 pt-16 sm:pt-20 pb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Tráfico de la Web</h1>
        <p className="text-sm text-gray-600 mb-6">Visitas registradas en insupec.com.ar</p>

        {/* Stats principales */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Eye size={16} className="text-blue-600" />
              <p className="text-sm text-gray-600 font-semibold">Total de visitas</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">{(totalGeneral ?? 0).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays size={16} className="text-emerald-600" />
              <p className="text-sm text-gray-600 font-semibold">Hoy</p>
            </div>
            <p className="text-3xl font-bold text-emerald-600">{stats.hoy.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <CalendarRange size={16} className="text-purple-600" />
              <p className="text-sm text-gray-600 font-semibold">Últimos 7 días</p>
            </div>
            <p className="text-3xl font-bold text-purple-600">{stats.semana.toLocaleString()}</p>
          </div>
        </div>

        {/* Gráfico de barras últimos 14 días */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-brand-600" />
            <h2 className="font-bold text-gray-900">Últimos {DIAS_HISTORIAL} días</h2>
          </div>
          <div className="flex items-end gap-1.5 h-32">
            {stats.dias.map((d) => (
              <div key={d.fecha} className="flex-1 flex flex-col items-center justify-end gap-1 group relative">
                <span className="text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5">
                  {d.visitas}
                </span>
                <div
                  className="w-full bg-brand-500 rounded-t hover:bg-brand-600 transition-colors"
                  style={{ height: `${Math.max(4, (d.visitas / maxDia) * 100)}%` }}
                />
                <span className="text-[9px] text-gray-400">{d.fecha.slice(8, 10)}/{d.fecha.slice(5, 7)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Páginas más visitadas */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
            <h2 className="font-bold text-gray-900 mb-3">Páginas más visitadas</h2>
            <div className="space-y-1.5">
              {stats.topPaginas.map(([pagina, count]) => (
                <div key={pagina} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                  <span className="text-sm text-gray-700 truncate">{pagina}</span>
                  <span className="text-sm font-bold text-brand-600 flex-shrink-0 ml-2">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Orígenes de tráfico */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-200">
            <h2 className="font-bold text-gray-900 mb-3">De dónde vienen</h2>
            <div className="space-y-1.5">
              {stats.topReferrers.map(([origen, count]) => (
                <div key={origen} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                  <span className="text-sm text-gray-700 truncate">{origen}</span>
                  <span className="text-sm font-bold text-brand-600 flex-shrink-0 ml-2">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {visitas.length >= LIMITE_FILAS && (
          <p className="text-xs text-gray-400 mt-4">
            Calculado sobre las últimas {LIMITE_FILAS.toLocaleString()} visitas registradas.
          </p>
        )}
      </div>
    </>
  );
}

export default function TraficoPage() {
  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50">
        <TraficoContent />
      </div>
    </ProtectedAdminRoute>
  );
}
