'use server'

import { listUntiedPixController } from '@/src/interface-adapters/controllers/pix/list-untied-pix.controller'

export async function listUntiedPixAction() {
  return listUntiedPixController()
}
