'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { adminFetch } from '@/lib/api'
import type { AdminFarmer } from '@/lib/types'

export async function createFarmer(formData: FormData) {
  const vaultId = String(formData.get('vaultId') ?? '')
  const farmer = await adminFetch<AdminFarmer>('/admin/farmers', {
    method: 'POST',
    body: JSON.stringify({
      name: String(formData.get('name')),
      idLine: String(formData.get('idLine')),
      vaultLine: String(formData.get('vaultLine')),
      ...(vaultId ? { vaultId } : {}),
    }),
  })
  revalidatePath('/farmers')
  redirect(`/farmers/${farmer.id}`)
}

export async function updateFarmer(id: string, patch: Record<string, unknown>) {
  await adminFetch<AdminFarmer>(`/admin/farmers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
  revalidatePath('/farmers')
  revalidatePath(`/farmers/${id}`)
}

export async function archiveFarmer(id: string) {
  await updateFarmer(id, { status: 'archived' })
  redirect('/farmers')
}
