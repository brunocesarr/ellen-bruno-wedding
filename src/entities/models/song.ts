import { z } from 'zod'

export const SongSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  audioPath: z.string().min(1),
  displayOrder: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type Song = z.infer<typeof SongSchema>

export const CreateSongInputSchema = z.object({
  title: z.string().min(1).max(120),
  audioPath: z.string().min(1),
  displayOrder: z.coerce.number().int().min(0).default(0),
})
export type CreateSongInput = z.infer<typeof CreateSongInputSchema>
