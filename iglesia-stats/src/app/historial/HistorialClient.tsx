'use client'
import { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Encuentro, Campus } from '@/types'

export default function HistorialClient({ encuentros, campuses, profile }: {
  encuentros: Encuentro[]; campuses: Campus[]; profile: any
}) {
  const [search, setSearch] = useState('')
  const [campusFilter, setCampusFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [selected, setSelected] = useState<Encuentro | null>(null)

  const isSuperAdmin = profile?.role === 'superadmin'
  const years = useMemo(
    () =>
      Array.from(
        new Set(
          encuentros
            .map((e) => e.fecha?.slice(0, 4))
            .filter((year): year is string => Boolean(year))
        )
      )
        .sort()
        .reverse(),
    [encuentros]
  )

  const filtered = useMemo(() => encuentros.filter(e => {
    if (campusFilter !== 'all' && e.campus_id !== campusFilter) return false
    if (yearFilter !== 'all' && !e.fecha?.startsWith(yearFilter)) return false
    if (search) {
      const q = search.toLowerCase()
      return e.nombre_encuentro?.toLowerCase().includes(q) || e.predicador?.toLowerCase().includes(q) || e.nombre_mensaje?.toLowerCase().includes(q)
    }
    return true
  }), [encuentros, campusFilter, yearFilter, search])

  function exportCSV() {
    const headers = ['Fecha','Campus','Encuentro','Modalidad','Predicador','Mensaje','Asistencia Auditorio','Kids','Tweens','Sala bebé','Sensorial','Aceptaron Jesús Presencial','Total General','Vol. Servicio','Vol. Técnica','Vol. Worship','Vol. Kids','Vol. Tweens','Vol. RRSS','Vol. Seguridad','Vol. Cocina','Vol. Oración','Vol. Sala bebés','Vol. Conexión','Vol. Merch','Vol. Amor casa','Vol. Sensorial','Vol. P.Siembra','Aceptaron Jesús Online','Espectadores','Líderes Voluntarios','Adm. Campus']
    const rows = filtered.map(e => {
      const c = campuses.find(c => c.id === e.campus_id)
      return [e.fecha,c?.name||'',e.nombre_encuentro,e.modalidad,e.predicador,e.nombre_mensaje||'',
        e.asistencia_auditorio,e.asistencia_kids,e.asistencia_tweens,e.asistencia_sala_bebe,e.asistencia_sala_sensorial,
        e.acepto_jesus_presencial,e.total_general,
        e.vol_servicio,e.vol_tecnica,e.vol_worship,e.vol_kids,e.vol_tweens,e.vol_rrss,e.vol_seguridad,e.vol_cocina,e.vol_oracion,e.vol_sala_bebes,e.vol_conexion,e.vol_merch,e.vol_amor_casa,e.vol_sala_sensorial,e.vol_punto_siembra,
        e.acepto_jesus_online,e.espectadores,e.lideres_voluntarios||'',e.adm_campus||''].join(',')
    })
    const csv = [headers.join(','), ...rows].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['\uFEFF'+csv], { type: 'text/csv;charset=utf-8' }))
    a.download = `encuentros_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Historial de encuentros</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} registros</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input type="text" placeholder="Buscar por encuentro, predicador o mensaje..." value={search} onChange={e => setSearch(e.target.value)} className="input-field flex-1 min-w-48" />
        {isSuperAdmin && (
          <select value={campusFilter} onChange={e => setCampusFilter(e.target.value)} className="input-field w-44">
            <option value="all">Todos los campus</option>
            {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="input-field w-32">
          <option value="all">Todos los años</option>
          {years.map(y => <option key={y} value={y!}>{y}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Fecha</th>
                {isSuperAdmin && <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Campus</th>}
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Encuentro</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Predicador</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400">Auditorio</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400">A Jesús</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Modalidad</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const campus = campuses.find(c => c.id === e.campus_id)
                const jesus = (e.acepto_jesus_presencial || 0) + (e.acepto_jesus_online || 0)
                return (
                  <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelected(e)}>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {e.fecha ? format(parseISO(e.fecha), 'dd MMM yyyy', { locale: es }) : '—'}
                    </td>
                    {isSuperAdmin && <td className="py-3 px-4 text-gray-500">{campus?.name || '—'}</td>}
                    <td className="py-3 px-4 font-medium text-gray-900">{e.nombre_encuentro}</td>
                    <td className="py-3 px-4 text-gray-600">{e.predicador}</td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">{(e.asistencia_auditorio || 0).toLocaleString('es-CL')}</td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">{jesus.toLocaleString('es-CL')}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-brand-50 text-brand-700 font-medium">{e.modalidad}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5l7 7-7 7" />
                      </svg>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center text-gray-400 text-sm">No se encontraron encuentros</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900">{selected.nombre_encuentro}</h2>
                <p className="text-sm text-gray-500">{selected.fecha ? format(parseISO(selected.fecha), 'EEEE dd \'de\' MMMM yyyy', { locale: es }) : ''}</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">✕</button>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Campus', campuses.find(c=>c.id===selected.campus_id)?.name || '—'],
                  ['Modalidad', selected.modalidad],
                  ['Predicador', selected.predicador],
                  ['Mensaje', selected.nombre_mensaje || '—'],
                ].map(([l,v]) => (
                  <div key={l}>
                    <p className="text-xs text-gray-400 mb-0.5">{l}</p>
                    <p className="font-medium text-gray-900">{v}</p>
                  </div>
                ))}
              </div>

              {(selected.modalidad === 'Presencial' || selected.modalidad === 'Presencial+Online') && (
                <div>
                  <p className="section-title">Presencial</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      ['Aceptaron a Jesús', selected.acepto_jesus_presencial],
                      ['Total general', selected.total_general],
                      ['Auditorio', selected.asistencia_auditorio],
                      ['Kids', selected.asistencia_kids],
                      ['Tweens', selected.asistencia_tweens],
                      ['Sala bebé', selected.asistencia_sala_bebe],
                      ['Sala sensorial', selected.asistencia_sala_sensorial],
                    ].map(([l,v]) => (
                      <div key={l as string} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-0.5">{l}</p>
                        <p className="text-lg font-bold text-gray-900">{(v as number || 0).toLocaleString('es-CL')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="section-title">Voluntarios</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ['Servicio', selected.vol_servicio],['Técnica', selected.vol_tecnica],
                    ['Worship', selected.vol_worship],['Kids', selected.vol_kids],
                    ['Tweens', selected.vol_tweens],['RRSS', selected.vol_rrss],
                    ['Seguridad', selected.vol_seguridad],['Cocina', selected.vol_cocina],
                    ['Oración', selected.vol_oracion],['Sala bebés', selected.vol_sala_bebes],
                    ['Conexión', selected.vol_conexion],['Merch', selected.vol_merch],
                    ['Amor casa', selected.vol_amor_casa],['Sensorial', selected.vol_sala_sensorial],
                    ['P. Siembra', selected.vol_punto_siembra],
                  ].map(([l,v]) => (
                    <div key={l as string} className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-xs text-gray-500">{l}</p>
                      <p className="font-bold text-gray-900">{v as number || 0}</p>
                    </div>
                  ))}
                </div>
              </div>

              {(selected.modalidad === 'Online' || selected.modalidad === 'Presencial+Online') && (
                <div>
                  <p className="section-title">Online</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-0.5">Aceptaron a Jesús</p>
                      <p className="text-lg font-bold text-gray-900">{selected.acepto_jesus_online || 0}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-0.5">Espectadores a la vez</p>
                      <p className="text-lg font-bold text-gray-900">{selected.espectadores || 0}</p>
                    </div>
                  </div>
                </div>
              )}

              {(selected.lideres_voluntarios || selected.adm_campus || selected.observaciones) && (
                <div>
                  <p className="section-title">Notas</p>
                  <div className="space-y-2 text-sm">
                    {selected.lideres_voluntarios && <p><span className="text-gray-500">Líderes:</span> <span className="font-medium">{selected.lideres_voluntarios}</span></p>}
                    {selected.adm_campus && <p><span className="text-gray-500">Admins:</span> <span className="font-medium">{selected.adm_campus}</span></p>}
                    {selected.observaciones && <p><span className="text-gray-500">Obs:</span> {selected.observaciones}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
