import { z } from 'zod'

const optionalUrl = z.string().url('Please enter a valid URL').optional().or(z.literal(''))

/** All time fields are plain `"HH:mm"` strings — what a native
 * `<input type="time">` produces — and get a trailing `:00` appended when
 * building the request body, matching the backend's `LocalTime`
 * (`HH:mm:ss`) expectation. */
export const khutbahFormSchema = z.object({
  khutbahDate: z.string().min(1, 'Required'),
  topic: z.string().min(1, 'Required').max(200),
  khatibName: z.string().min(1, 'Required').max(150),
  batchNumber: z.string().optional(),
  khutbahTime: z.string().min(1, 'Required'),
  adhaanTime: z.string().optional(),
  iqamahTime: z.string().optional(),
  language: z.string().max(50).optional(),
  streamUrl: optionalUrl,
  recordingUrl: optionalUrl,
  notes: z.string().max(1000).optional(),
})

export type KhutbahFormValues = z.infer<typeof khutbahFormSchema>
