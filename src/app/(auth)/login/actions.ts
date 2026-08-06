'use server'

import { redirect } from 'next/navigation'
import { setToken } from '@/lib/session'

const BASE_URL = process.env.CORE_SERVICES_URL ?? 'http://localhost:3000'

export interface LoginState {
  error?: string
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  const res = await fetch(`${BASE_URL}/admin/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) return { error: 'Invalid email or password' }

  const { token } = (await res.json()) as { token: string }
  await setToken(token)
  redirect('/vaults')
}
