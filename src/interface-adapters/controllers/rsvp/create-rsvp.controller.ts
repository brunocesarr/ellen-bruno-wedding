import { createRsvpUseCase } from '@/src/application/use-cases/rsvp/create-rsvp.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '../_handle'

export async function createRsvpController(input: unknown) {
  const { rsvpRepo } = await getContainer()
  return handle(async () => {
    const rsvp = await createRsvpUseCase({ rsvpRepo })(input)
    return { id: rsvp.id, fullName: rsvp.fullName }
  })
}
