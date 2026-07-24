'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { adminFetch } from '@/lib/api'
import type { AdminVault } from '@/lib/types'

export async function createVault(formData: FormData) {
  const vault = await adminFetch<AdminVault>('/admin/vaults', {
    method: 'POST',
    body: JSON.stringify({
      code: String(formData.get('code')),
      cropKind: String(formData.get('cropKind')),
      cropLabel: String(formData.get('cropLabel')),
      location: String(formData.get('location')),
      dayTotal: Number(formData.get('dayTotal')),
    }),
  })
  revalidatePath('/vaults')
  redirect(`/vaults/${vault.id}`)
}

export async function updateVault(id: string, patch: Record<string, unknown>) {
  await adminFetch<AdminVault>(`/admin/vaults/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
  revalidatePath('/vaults')
  revalidatePath(`/vaults/${id}`)
}

export async function archiveVault(id: string) {
  await updateVault(id, { status: 'archived' })
  redirect('/vaults')
}
