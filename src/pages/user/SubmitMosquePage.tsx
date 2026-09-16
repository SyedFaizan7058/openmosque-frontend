import { useNavigate } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MosqueSubmissionForm } from '@/features/submissions/components/MosqueSubmissionForm'

/**
 * Crowdsourced "submit a new mosque" flow: POST /mosques/submissions,
 * which lands in a moderator's review queue rather than going live
 * immediately (see backend-api-contract.md, moderation module). Redirects
 * home on success (a success toast already confirms the submission) since
 * there's no per-user "my submissions" page yet to send them to instead.
 */
export default function SubmitMosquePage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="size-5 text-primary" aria-hidden="true" />
            Contribute a Mosque
          </CardTitle>
          <CardDescription>
            Know a mosque that isn't listed yet? Submit its details below - a moderator will review it before it goes
            live.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MosqueSubmissionForm mode="new" onSuccess={() => navigate('/')} />
        </CardContent>
      </Card>
    </div>
  )
}
