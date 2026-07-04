import { beforeEach, describe, expect, it, vi } from 'vitest'

const revalidatePath = vi.fn()
vi.mock('next/cache', () => ({ revalidatePath: (...args: unknown[]) => revalidatePath(...args) }))

import { revalidateGroup } from '../revalidate'

describe('revalidateGroup', () => {
  beforeEach(() => revalidatePath.mockClear())

  it('revalidates every path in a plain group', () => {
    revalidateGroup('guests')
    expect(revalidatePath).toHaveBeenCalledWith('/admin')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/convidados')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/resumo')
    expect(revalidatePath).toHaveBeenCalledTimes(3)
  })

  it('passes the type argument for tuple specs', () => {
    revalidateGroup('siteImages')
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/imagens')
  })
})
