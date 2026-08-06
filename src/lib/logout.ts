'use server'

import { clearToken } from './session'

export async function clearTokenAction() {
  await clearToken()
}
