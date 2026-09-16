import { Building2 } from 'lucide-react'
import { MosqueAdminHeader } from '@/features/mosqueAdmin/components/MosqueAdminHeader'
import { MosqueProfileForm } from '@/features/mosqueAdmin/components/MosqueProfileForm'

export default function MosqueProfileEditPage() {
  return (
    <MosqueAdminHeader
      title="Edit Mosque Profile"
      description="Update your mosque's public listing directly."
      icon={Building2}
    >
      {(mosque) => <MosqueProfileForm mosque={mosque} />}
    </MosqueAdminHeader>
  )
}
