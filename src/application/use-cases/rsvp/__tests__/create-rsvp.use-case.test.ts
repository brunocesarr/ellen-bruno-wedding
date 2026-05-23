import { ValidationError } from '@/src/entities/errors/common'
import { describe, expect, it, vi } from 'vitest'
import { createRsvpUseCase } from '../create-rsvp.use-case'

describe('createRsvpUseCase', () => {
  it('creates an RSVP', async () => {
    const repo = {
      create: vi.fn().mockResolvedValue({ id: 'x', fullName: 'Ana' }),
    } as any
    const result = await createRsvpUseCase({ rsvpRepo: repo })({
      fullName: 'Ana',
      attending: true,
      companions: 2,
    })
    expect(result.id).toBe('x')
  })
  it('throws on missing fullName', async () => {
    const repo = { create: vi.fn() } as any
    await expect(
      createRsvpUseCase({ rsvpRepo: repo })({ attending: true })
    ).rejects.toBeInstanceOf(ValidationError)
  })
})
