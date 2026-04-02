'use client'
import { useMemo, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { format, parseISO, startOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Encuentro, Campus } from '@/types'

function KPICard({ label, value, sub, color = 'brand' }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-3xl font-bold text-gray-900`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function DashboardClient({
  encuentros, campuses, profile
}: {
  encuentros: Encuentro[]
  campuses: Campus[]
  profile: any
}) {
  const [campusFilter, setCampusFilter] = useState('all')
  const isSuperAdmin = profile?.role === 'superadmin'

  const filtered = useMemo(() =>
    campusFilter === 'all' ? encuentros : encuentros.filter(e => e.campus_id === campusFilter)
  , [encuentros, campusFilter])

  const kpis = useMemo(() => ({
    asistencia: filtered.reduce((s, e) => s + (e.asistencia_auditorio || 0), 0),
    jesus: filtered.reduce((s, e) => s + (e.acepto_jesus_presencial || 0) + (e.acepto_jesus_online || 0), 0),
    eventos: filtered.length,
    espectadores: filtered.reduce((s, e) => s + (e.espectadores || 0), 0),
  }), [filtered])

  const byMonth = useMemo(() => {
    const map: Record<string, { mes: string; asistencia: number; jesus: number; eventos: number }> = {}
    filtered.forEach(e => {
      if (!e.fecha) return
      const key = format(parseISO(e.fecha), 'yyyy-MM')
      if (!map[key]) map[key] = { mes: format(parseISO(e.fecha), 'MMM yy', { locale: es }), asistencia: 0, jesus: 0, eventos: 0 }
      map[key].asistencia += e.asistencia_auditorio || 0
      map[key].jesus += (e.acepto_jesus_presencial || 0) + (e.acepto_jesus_online || 0)
      map[key].eventos += 1
    })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([, v]) => v)
  }, [filtered])

  const byCampus = useMemo(() => {
    const map: Record<string, { campus: string; asistencia: number; jesus: number }> = {}
    encuentros.forEach(e => {
      const c = campuses.find(c => c.id === e.campus_id)
      if (!c) return
      if (!map[c.id]) map[c.id] = { campus: c.name, asistencia: 0, jesus: 0 }
      map[c.id].asistencia += e.asistencia_auditorio || 0
      map[c.id].jesus += (e.acepto_jesus_presencial || 0) + (e.acepto_jesus_online || 0)
    })
    return Object.values(map).sort((a, b) => b.asistencia - a.asistencia)
  }, [encuentros, campuses])

  const volTotals = useMemo(() => {
    const keys = ['vol_servicio','vol_tecnica','vol_worship','vol_kids','vol_tweens','vol_rrss','vol_seguridad','vol_cocina','vol_oracion','vol_sala_bebes','vol_conexion','vol_merch','vol_amor_casa','vol_sala_sensorial','vol_punto_siembra']
    const labels: Record<string,string> = {
      vol_servicio:'Servicio',vol_tecnica:'Técnica',vol_worship:'Worship',vol_kids:'Kids',
      vol_tweens:'Tweens',vol_rrss:'RRSS',vol_seguridad:'Seguridad',vol_cocina:'Cocina',
      vol_oracion:'Oración',vol_sala_bebes:'Sala bebé',vol_conexion:'Conexión',vol_merch:'Merch',
      vol_amor_casa:'Amor casa',vol_sala_sensorial:'Sensorial',vol_punto_siembra:'P. Siembra'
    }
    return keys.map(k => ({
      area: labels[k],
      total: filtered.reduce((s, e) => s + ((e as any)[k] || 0), 0)
    })).sort((a,b) => b.total - a.total)
  }, [filtered])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Estadísticas de encuentros en tiempo real</p>
        </div>
        {isSuperAdmin && (
          <select
            value={campusFilter}
            onChange={e => setCampusFilter(e.target.value)}
            className="input-field w-48"
          >
            <option value="all">Todos los campus</option>
            {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard label="Asistencia total" value={kpis.asistencia.toLocaleString('es-CL')} sub="Auditorio presencial" />
        <KPICard label="Aceptaron a Jesús" value={kpis.jesus.toLocaleString('es-CL')} sub="Presencial + online" />
        <KPICard label="Total encuentros" value={kpis.eventos.toLocaleString('es-CL')} />
        <KPICard label="Espectadores online" value={kpis.espectadores.toLocaleString('es-CL')} sub="Máximo a la vez" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="card p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Asistencia mensual</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={byMonth}>
              <defs>
                <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4338CA" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#4338CA" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => v.toLocaleString('es-CL')} />
              <Area type="monotone" dataKey="asistencia" stroke="#4338CA" fill="url(#ga)" strokeWidth={2} name="Asistencia" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Aceptaron a Jesús por mes</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => v.toLocaleString('es-CL')} />
              <Bar dataKey="jesus" fill="#059669" radius={[4,4,0,0]} name="Aceptaron a Jesús" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      {isSuperAdmin && (
        <div className="card p-5 mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-4">Asistencia por campus</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byCampus} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="campus" type="category" tick={{ fontSize: 11 }} width={110} />
              <Tooltip formatter={(v: number) => v.toLocaleString('es-CL')} />
              <Legend />
              <Bar dataKey="asistencia" fill="#4338CA" radius={[0,4,4,0]} name="Asistencia" />
              <Bar dataKey="jesus" fill="#059669" radius={[0,4,4,0]} name="Aceptaron a Jesús" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Voluntarios */}
      <div className="card p-5">
        <p className="text-sm font-semibold text-gray-700 mb-4">Voluntarios por área</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {volTotals.map(v => (
            <div key={v.area} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">{v.area}</p>
              <p className="text-lg font-bold text-gray-900">{v.total.toLocaleString('es-CL')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Últimos encuentros */}
      <div className="card p-5 mt-4">
        <p className="text-sm font-semibold text-gray-700 mb-4">Últimos encuentros</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400">Fecha</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400">Encuentro</th>
                {isSuperAdmin && <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400">Campus</th>}
                <th className="text-right py-2 px-3 text-xs font-semibold text-gray-400">Asistencia</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-gray-400">A Jesús</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400">Modalidad</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 15).map(e => {
                const campus = campuses.find(c => c.id === e.campus_id)
                return (
                  <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3 text-gray-600">{e.fecha ? format(parseISO(e.fecha), 'dd MMM yyyy', { locale: es }) : '—'}</td>
                    <td className="py-2.5 px-3 font-medium text-gray-900">{e.nombre_encuentro}</td>
                    {isSuperAdmin && <td className="py-2.5 px-3 text-gray-500">{campus?.name || '—'}</td>}
                    <td className="py-2.5 px-3 text-right font-semibold text-gray-900">{(e.asistencia_auditorio || 0).toLocaleString('es-CL')}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-600 font-semibold">{((e.acepto_jesus_presencial || 0) + (e.acepto_jesus_online || 0)).toLocaleString('es-CL')}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-brand-50 text-brand-700 font-medium">{e.modalidad}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
