import type { IAnimationSender } from '@/src/application/services/notification.service.interface'
import { describe, expect, it, vi } from 'vitest'
import { notifyWeddingCountdownUseCase } from '../notify-wedding-countdown.use-case'

const setup = () => {
  const send = vi.fn().mockResolvedValue(undefined)
  const run = notifyWeddingCountdownUseCase({
    notificationService: { send },
    weddingDate: '2026-10-24',
    couple: 'Ellen & Bruno',
    displayDate: '24 de Outubro, 2026',
  })
  return { send, run }
}

describe('notifyWeddingCountdownUseCase', () => {
  it('sends the countdown with days left', async () => {
    const { send, run } = setup()
    expect(await run('2026-10-16')).toEqual({ sent: true, daysLeft: 8 })
    expect(send).toHaveBeenCalledOnce()
    expect(send.mock.calls[0]![0]).toContain('Faltam 8 dias')
  })

  it('sends the special message on the wedding day', async () => {
    const { send, run } = setup()
    expect(await run('2026-10-24')).toEqual({ sent: true, daysLeft: 0 })
    expect(send.mock.calls[0]![0]).toContain('HOJE É O DIA')
  })

  it('uses the singular on the last day before', async () => {
    const { send, run } = setup()
    await run('2026-10-23')
    expect(send.mock.calls[0]![0]).toContain('Falta 1 dia')
  })

  it('sends nothing before the window or after the wedding', async () => {
    const { send, run } = setup()
    expect((await run('2026-09-01')).sent).toBe(false)
    expect((await run('2026-10-25')).sent).toBe(false)
    expect(send).not.toHaveBeenCalled()
  })

  it('lets a send failure surface', async () => {
    const { send, run } = setup()
    send.mockRejectedValue(new Error('telegram down'))
    await expect(run('2026-10-20')).rejects.toThrow('telegram down')
  })

  describe('with an animation', () => {
    const setupGif = (sendAnimation: IAnimationSender['sendAnimation']) => {
      const send = vi.fn().mockResolvedValue(undefined)
      const run = notifyWeddingCountdownUseCase({
        notificationService: { send, sendAnimation },
        weddingDate: '2026-10-24',
        couple: 'Ellen & Bruno',
        displayDate: '24 de Outubro, 2026',
        animationUrl: (d) => `https://x.test/day-${d}.gif`,
      })
      return { send, run }
    }

    it('sends the GIF with the message as caption instead of plain text', async () => {
      const sendAnimation = vi
        .fn<IAnimationSender['sendAnimation']>()
        .mockResolvedValue(undefined)
      const { send, run } = setupGif(sendAnimation)
      await run('2026-10-20')
      expect(sendAnimation).toHaveBeenCalledWith(
        'https://x.test/day-4.gif',
        expect.stringContaining('Faltam 4 dias')
      )
      expect(send).not.toHaveBeenCalled()
    })

    it('falls back to plain text when the GIF fails', async () => {
      const sendAnimation = vi
        .fn<IAnimationSender['sendAnimation']>()
        .mockRejectedValue(new Error('bad url'))
      const { send, run } = setupGif(sendAnimation)
      expect(await run('2026-10-20')).toEqual({ sent: true, daysLeft: 4 })
      expect(send).toHaveBeenCalledOnce()
    })
  })
})
