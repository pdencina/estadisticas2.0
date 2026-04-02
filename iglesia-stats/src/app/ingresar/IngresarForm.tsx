'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Campus } from '@/types'

function NumInput({ label, name, value, onChange }: { label: string; name: string; value: number; onChange: (n: string, v: number) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="number" min="0" value={value}
        onChange={e => onChange(name, parseInt(e.target.value) || 0)}
        className="input-field"
      />
    </div>
  )
}

const ENCUENTROS = [
  'Miércoles 20:00 hrs',
  'Jueves 20:00 hrs',
  'Sábado 17:30 hrs',
  'Domingo 09:00 hrs',
  'Domingo 11:00 hrs',
  'Domingo 13:00 hrs',
  'Domingo 17:00 hrs',
  'Domingo 18:00 hrs',
  'Domingo 19:00 hrs',
  'Gold 11:00 hrs',
  'Oración Miércoles 06:00 hrs',
  'Otro',
]

const PREDICADORES = [
  'Pr. Patricio Andrés Burgos',
  'Pr. Patricio Fernando Burgos',
  'Pr. Francisco Henríquez',
  'Pr. Evelin Fuentes',
  'Pr. Rodrigo Quiroz',
  'Pr. Naty Segura',
  'Pr. Patricia Alarcón',
  'Pr. Daniel Villalba',
  'Pr. Jesús Camargo',
  'Pr. Priscilla Fabio',
  'Otro',
]

const defaultVols = {
  vol_servicio: 0, vol_tecnica: 0, vol_kids: 0, vol_tweens: 0,
  vol_worship: 0, vol_cocina: 0, vol_rrss: 0, vol_seguridad: 0,
  vol_sala_bebes: 0, vol_conexion: 0, vol_oracion: 0, vol_merch: 0,
  vol_amor_casa: 0, vol_sala_sensorial: 0, vol_punto_siembra: 0,
}

export default function IngresarForm({ profile, campuses }: { profile: any; campuses: Campus[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const defaultCampus = profile?.role !== 'superadmin' ? profile?.campus_id : ''

  const [form, setForm] = useState({
    campus_id: defaultCampus || '',
    fecha: new Date().toISOString().split('T')[0],
    nombre_encuentro: '',
    nombre_encuentro_otro: '',
    modalidad: 'Presencial' as 'Presencial' | 'Online' | 'Presencial+Online',
    predicador: '',
    predicador_otro: '',
    nombre_mensaje: '',

    acepto_jesus_presencial: 0,
    total_general: 0,
    asistencia_auditorio: 0,
    asistencia_kids: 0,
    asistencia_tweens: 0,
    asistencia_sala_bebe: 0,
    asistencia_sala_sensorial: 0,

    ...defaultVols,

    acepto_jesus_online: 0,
    espectadores: 0,

    lideres_voluntarios: '',
    adm_campus: '',
    observaciones: '',
  })

  function set(name: string, value: any) {
    setForm(f => ({ ...f, [name]: value }))
  }

  function setNum(name: string, value: number) {
    setForm(f => ({ ...f, [name]: value }))
  }

  const nombreFinal = form.nombre_encuentro === 'Otro' ? form.nombre_encuentro_otro : form.nombre_encuentro
  const predicadorFinal = form.predicador === 'Otro' ? form.predicador_otro : form.predicador
  const showOnline = form.modalidad === 'Online' || form.modalidad === 'Presencial+Online'
  const showPresencial = form.modalidad === 'Presencial' || form.modalidad === 'Presencial+Online'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.campus_id || !nombreFinal || !predicadorFinal) {
      setError('Completa los campos obligatorios: campus, encuentro y predicador.')
      return
    }
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    const payload = {
      campus_id: form.campus_id,
      fecha: form.fecha,
      nombre_encuentro: `Encuentro ${nombreFinal}`,
      modalidad: form.modalidad,
      predicador: predicadorFinal,
      nombre_mensaje: form.nombre_mensaje || null,

      acepto_jesus_presencial: form.acepto_jesus_presencial,
      total_general: form.total_general,
      asistencia_auditorio: form.asistencia_auditorio,
      asistencia_kids: form.asistencia_kids,
      asistencia_tweens: form.asistencia_tweens,
      asistencia_sala_bebe: form.asistencia_sala_bebe,
      asistencia_sala_sensorial: form.asistencia_sala_sensorial,

      ...Object.fromEntries(Object.keys(defaultVols).map(k => [k, (form as any)[k]])),

      acepto_jesus_online: showOnline ? form.acepto_jesus_online : 0,
      espectadores: showOnline ? form.espectadores : 0,

      lideres_voluntarios: form.lideres_voluntarios || null,
      adm_campus: form.adm_campus || null,
      observaciones: form.observaciones || null,
      created_by: user?.id,
    }

    const { error: dbError } = await supabase.from('encuentros').insert(payload)
    setSaving(false)

    if (dbError) { setError(dbError.message); return }
    setSuccess(true)
    setTimeout(() => { setSuccess(false); router.push('/historial') }, 1800)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Ingresar datos de encuentro</h1>
        <p className="text-sm text-gray-500 mt-0.5">Completa el formulario con la información del encuentro</p>
      </div>

      {success && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-700 font-medium">
          ✓ Encuentro registrado correctamente. Redirigiendo al historial...
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Datos generales */}
        <div className="card p-5">
          <p className="section-title">Datos generales</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha *</label>
              <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Campus *</label>
              {profile?.role === 'superadmin' ? (
                <select value={form.campus_id} onChange={e => set('campus_id', e.target.value)} className="input-field" required>
                  <option value="">Seleccionar campus</option>
                  {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              ) : (
                <input value={profile?.campus?.name || ''} className="input-field bg-gray-50" readOnly />
              )}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Encuentro *</label>
              <select value={form.nombre_encuentro} onChange={e => set('nombre_encuentro', e.target.value)} className="input-field" required>
                <option value="">Seleccionar encuentro</option>
                {ENCUENTROS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            {form.nombre_encuentro === 'Otro' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del encuentro</label>
                <input type="text" value={form.nombre_encuentro_otro} onChange={e => set('nombre_encuentro_otro', e.target.value)} className="input-field" placeholder="Ej: Retiro jóvenes" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Modalidad *</label>
              <select value={form.modalidad} onChange={e => set('modalidad', e.target.value as any)} className="input-field" required>
                <option value="Presencial">Presencial</option>
                <option value="Online">Online</option>
                <option value="Presencial+Online">Presencial + Online</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Predicador *</label>
              <select value={form.predicador} onChange={e => set('predicador', e.target.value)} className="input-field" required>
                <option value="">Seleccionar predicador</option>
                {PREDICADORES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            {form.predicador === 'Otro' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del predicador</label>
                <input type="text" value={form.predicador_otro} onChange={e => set('predicador_otro', e.target.value)} className="input-field" />
              </div>
            )}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del mensaje</label>
              <input type="text" value={form.nombre_mensaje} onChange={e => set('nombre_mensaje', e.target.value)} className="input-field" placeholder="Ej: Nueva clase de vida" />
            </div>
          </div>
        </div>

        {/* Presencial */}
        {showPresencial && (
          <div className="card p-5">
            <p className="section-title">Presencial</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <NumInput label="Aceptaron a Jesús" name="acepto_jesus_presencial" value={form.acepto_jesus_presencial} onChange={setNum} />
              <NumInput label="Total general" name="total_general" value={form.total_general} onChange={setNum} />
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-3">Asistencia</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <NumInput label="Auditorio" name="asistencia_auditorio" value={form.asistencia_auditorio} onChange={setNum} />
              <NumInput label="Kids" name="asistencia_kids" value={form.asistencia_kids} onChange={setNum} />
              <NumInput label="Tweens" name="asistencia_tweens" value={form.asistencia_tweens} onChange={setNum} />
              <NumInput label="Sala bebé" name="asistencia_sala_bebe" value={form.asistencia_sala_bebe} onChange={setNum} />
              <NumInput label="Sala sensorial" name="asistencia_sala_sensorial" value={form.asistencia_sala_sensorial} onChange={setNum} />
            </div>
          </div>
        )}

        {/* Voluntarios */}
        <div className="card p-5">
          <p className="section-title">Voluntarios</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              ['vol_servicio','Servicio'],['vol_tecnica','Técnica'],['vol_kids','Kids'],
              ['vol_tweens','Tweens'],['vol_worship','Worship'],['vol_cocina','Cocina'],
              ['vol_rrss','R.R.S.S'],['vol_seguridad','Seguridad'],['vol_sala_bebes','Sala bebés'],
              ['vol_conexion','Conexión'],['vol_oracion','Oración'],['vol_merch','Merch'],
              ['vol_amor_casa','Amor por la casa'],['vol_sala_sensorial','Sala sensorial'],
              ['vol_punto_siembra','Punto de siembra'],
            ].map(([name, label]) => (
              <NumInput key={name} label={label} name={name} value={(form as any)[name]} onChange={setNum} />
            ))}
          </div>
        </div>

        {/* Online */}
        {showOnline && (
          <div className="card p-5">
            <p className="section-title">Online</p>
            <div className="grid grid-cols-2 gap-4">
              <NumInput label="Aceptaron a Jesús" name="acepto_jesus_online" value={form.acepto_jesus_online} onChange={setNum} />
              <NumInput label="Espectadores a la vez" name="espectadores" value={form.espectadores} onChange={setNum} />
            </div>
          </div>
        )}

        {/* Líderes y observaciones */}
        <div className="card p-5">
          <p className="section-title">Líderes y observaciones</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Líderes de voluntarios</label>
              <input type="text" value={form.lideres_voluntarios} onChange={e => set('lideres_voluntarios', e.target.value)} className="input-field" placeholder="Ej: Juan Meneses & Pamela Fabio" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Administradores de campus</label>
              <input type="text" value={form.adm_campus} onChange={e => set('adm_campus', e.target.value)} className="input-field" placeholder="Ej: Miguel Castro & Paula Muñoz" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Observaciones</label>
              <textarea value={form.observaciones} onChange={e => set('observaciones', e.target.value)} rows={3} className="input-field resize-none" placeholder="Notas adicionales del encuentro..." />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pb-8">
          <button type="button" onClick={() => router.push('/dashboard')} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            )}
            {saving ? 'Guardando...' : 'Guardar encuentro'}
          </button>
        </div>
      </form>
    </div>
  )
}
