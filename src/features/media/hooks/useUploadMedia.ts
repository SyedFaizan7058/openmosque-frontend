import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { uploadMediaDirect } from '@/features/media/api/mediaApi'
import type { MediaFolderCategory } from '@/features/media/types'
import type { ApiErrorDetail } from '@/features/auth/types'

interface UploadMediaVariables {
  file: File
  category: MediaFolderCategory
}

/** One-shot direct upload (`POST /media/upload-direct`) — see the doc
 * comment on `uploadMediaDirect` for why this endpoint is used over the
 * pre-signed-URL flow. Deliberately not query-invalidating: the caller
 * owns what happens with the returned public URL (e.g. writing it into a
 * form field), so this hook stays a plain mutation with no cache side
 * effects of its own. */
export function useUploadMedia() {
  return useMutation({
    mutationFn: ({ file, category }: UploadMediaVariables) => uploadMediaDirect(file, category),
    onError: (error: ApiErrorDetail) => {
      toast.error(error?.message ?? 'Upload failed. Please try again.')
    },
  })
}
