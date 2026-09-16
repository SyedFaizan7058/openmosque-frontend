import { Clock } from 'lucide-react'
import { MosqueAdminHeader } from '@/features/mosqueAdmin/components/MosqueAdminHeader'
import { PrayerCalculationForm } from '@/features/mosqueAdmin/components/PrayerCalculationForm'
import { IqamahScheduleForm } from '@/features/mosqueAdmin/components/IqamahScheduleForm'

export default function PrayerConfigPage() {
  return (
    <MosqueAdminHeader
      title="Prayer Configuration"
      description="Control how prayer times are calculated and when Iqamah is called."
      icon={Clock}
    >
      {(mosque) => (
        <div className="flex flex-col gap-6">
          <PrayerCalculationForm mosqueId={mosque.id} />
          <IqamahScheduleForm mosqueId={mosque.id} />
        </div>
      )}
    </MosqueAdminHeader>
  )
}
