import { useState } from 'react'
import { HelpCircle, MessageCircleQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { useAuthStore, selectIsAuthenticated } from '@/features/auth/store/useAuthStore'
import { AskQuestionForm } from '@/features/questions/components/AskQuestionForm'
import { QuestionCard } from '@/features/questions/components/QuestionCard'
import { useQuestions } from '@/features/questions/hooks/useQuestions'

interface QuestionListProps {
  mosqueId: string
  idOrSlug: string
}

/** The mosque detail page's Q&A tab: an "ask a question" CTA and the
 * paginated question/answer threads. */
export function QuestionList({ mosqueId, idOrSlug }: QuestionListProps) {
  const [page, setPage] = useState(0)
  const [askOpen, setAskOpen] = useState(false)
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const { data, isLoading, isError } = useQuestions(idOrSlug, page)

  const questions = data?.content ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
        <div>
          <h3 className="flex items-center gap-2 text-base sm:text-lg font-bold text-foreground">
            <HelpCircle className="size-5 text-primary" aria-hidden="true" />
            Questions & Answers
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Ask the community or mosque administration about prayer times, facilities, or programs.
          </p>
        </div>
        {isAuthenticated && (
          <Button
            type="button"
            onClick={() => setAskOpen(true)}
            className="shrink-0 h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm shadow-xs gap-2 transition-all self-start sm:self-auto"
          >
            <MessageCircleQuestion className="size-4" aria-hidden="true" />
            <span>Ask a question</span>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState title="Couldn't load questions" description="Something went wrong reaching the server." />
      ) : questions.length === 0 ? (
        <EmptyState
          icon={MessageCircleQuestion}
          title="No questions yet"
          description="Ask about prayer times, facilities, or anything else."
        />
      ) : (
        <div className="flex flex-col">
          {questions.map((question) => (
            <QuestionCard key={question.id} question={question} idOrSlug={idOrSlug} />
          ))}
        </div>
      )}

      {data && <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />}

      <AskQuestionForm open={askOpen} onOpenChange={setAskOpen} mosqueId={mosqueId} idOrSlug={idOrSlug} />
    </div>
  )
}
