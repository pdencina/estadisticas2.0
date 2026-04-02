import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, campus:campus_id(id,name)')
    .single()

  let query = supabase.from('encuentros').select('*')

  if (profile?.role === 'admin_campus' || profile?.role === 'voluntario') {
    query = query.eq('campus_id', profile.campus_id)
  }

  const { data: encuentros } = await query.order('fecha', { ascending: false })
  const { data: campuses } = await supabase.from('campus').select('*').eq('active', true)

  return (
    <DashboardClient
      encuentros={encuentros ?? []}
      campuses={campuses ?? []}
      profile={profile}
    />
  )
}