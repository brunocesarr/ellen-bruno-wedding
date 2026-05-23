'use server'
import {
  signInController,
  signOutController,
} from '@/src/interface-adapters/controllers/auth/sign-in.controller'
import { redirect } from 'next/navigation'

export async function signInAction(_: unknown, formData: FormData) {
  const result = await signInController({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (result.ok) redirect('/admin')
  return result
}

export async function signOutAction() {
  await signOutController()
  redirect('/admin/login')
}
