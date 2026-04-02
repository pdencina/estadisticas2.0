'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Campus, Role, UserProfile } from '@/types'

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

type AdminUser = UserProfile & {
  campus?: Campus | null
}

export default function AdminClient({ users, campuses }: { users: AdminUser[]; campuses: Campus[] }) {
  const [list, setList] = useState<AdminUser[]>(users)
  const [saving, setSaving] = useState<string | null>(null)
  const supabase = createClient()

  async function updateUser(id: string, field: 'role' | 'campus_id', value: string) {
    setSaving(id)
    await supabase.from('profiles').update({ [field]: value || null }).eq('id', id)
    setList((current) => current.map((user) => (user.id === id ? { ...user, [field]: value || null } : user)))
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
            {list.map((user) => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-medium text-gray-900">{user.full_name || '—'}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={user.role}
                    onChange={(e) => updateUser(user.id, 'role', e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={user.campus_id || ''}
                    onChange={(e) => updateUser(user.id, 'campus_id', e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    <option value="">Sin campus</option>
                    {campuses.map((campus) => (
                      <option key={campus.id} value={campus.id}>
                        {campus.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-4">
                  {saving === user.id ? (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Guardando...
                    </span>
                  ) : (
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge[user.role] || 'bg-gray-100 text-gray-600'}`}>
                      {ROLES.find((role) => role.value === user.role)?.label || user.role}
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
          {campuses.map((campus) => (
            <div key={campus.id} className="bg-gray-50 rounded-xl p-3">
              <p className="font-medium text-gray-900 text-sm">{campus.name}</p>
              <p className="text-xs text-gray-400">
                {campus.city}, {campus.country}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
