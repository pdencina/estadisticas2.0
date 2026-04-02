'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Campus, Role } from '@/types'

const ROLES: { value: Role; label: string }[] = [
  { value: 'superadmin', label: 'Super Admin' },
  { value: 'admin_campus', label: 'Admin Campus' },
  { value: 'voluntario', label: 'Voluntario' },
  { value: 'viewer', label: 'Viewer' },
]

const roleBadge: Record<string, string> = {
  superadmin: 'bg-purple-50 text-purple-700',
  admin_campus: 'bg-brand-50 text-brand-700',
  voluntario: 'bg-emerald-50 text-emerald-700',
  viewer: 'bg-gray-100 text-gray-600',
}

export default function AdminClient({ users, campuses }: { users: any[]; campuses: Campus[] }) {
  const [list, setList] = useState(users)
  const [saving, setSaving] = useState<string | null>(null)
  const supabase = createClient()

  async function updateUser(id: string, field: 'role' | 'campus_id', value: string) {
    setSaving(id)
    await supabase.from('profiles').update({ [field]: value || null }).eq('id', id)
    setList(l => l.map(u => u.id === id ? { ...u, [field]: value } : u))
    setSaving(null)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Administración de usuarios</h1>
        <p className="text-sm text-gray-500 mt-0.5">{list.length} usuarios registrados</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Usuario</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Rol</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Campus</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Estado</th>
            </tr>
          </thead>
          <tbody>
            {list.map(u => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-medium text-gray-900">{u.full_name || '—'}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={u.role}
                    onChange={e => updateUser(u.id, 'role', e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={u.campus_id || ''}
                    onChange={e => updateUser(u.id, 'campus_id', e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    <option value="">Sin campus</option>
                    {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </td>
                <td className="py-3 px-4">
                  {saving === u.id ? (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Guardando...
                    </span>
                  ) : (
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge[u.role] || 'bg-gray-100 text-gray-600'}`}>
                      {ROLES.find(r => r.value === u.role)?.label || u.role}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 card p-5">
        <p className="section-title">Campus activos</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {campuses.map(c => (
            <div key={c.id} className="bg-gray-50 rounded-xl p-3">
              <p className="font-medium text-gray-900 text-sm">{c.name}</p>
              <p className="text-xs text-gray-400">{c.city}, {c.country}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
