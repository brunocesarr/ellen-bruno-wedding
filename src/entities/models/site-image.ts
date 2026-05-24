import { z } from 'zod'

export const SiteImageSchema = z.object({
  id: z.string().uuid(),
  key: z.string().min(1),
  section: z.string().min(1),
  imagePath: z.string().nullable(),
  alt: z.string().nullable(),
  displayOrder: z.number().int(),
  isActive: z.boolean(),
  updatedAt: z.date(),
})
export type SiteImage = z.infer<typeof SiteImageSchema>

export const UpsertSiteImageInputSchema = z.object({
  key: z.string().min(1).max(80),
  section: z.string().min(1).max(40),
  imagePath: z.string().optional(),
  alt: z.string().max(200).optional(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
})
export type UpsertSiteImageInput = z.infer<typeof UpsertSiteImageInputSchema>
