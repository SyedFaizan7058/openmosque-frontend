import { useState } from 'react';
import { MessageSquare, CheckCircle2, Send, Flag, AlertCircle, Edit2, Trash2, X, Check } from 'lucide-react';
import { useAuth } from '../../hooks';
import { timeAgo } from '../../utils/helpers';

function AnswerItem({ answer, mosqueId, onUpdateAnswer, onDeleteAnswer, onFlagContent }) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(answer.answerText || answer.text || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const isOfficial = answer.officialMosqueAdmin || answer.is_official_mosque_admin;
  const ansText = answer.answerText || answer.text || '';
  const ansAuthor = answer.userDisplayName || answer.userName || (isOfficial ? 'Mosque Administration' : 'Community Member');

  const isMosqueAdminForThisMosque = Boolean(
    user && user.role === 'MOSQUE_ADMIN' && mosqueId && (
      (Array.isArray(user.claimedMosqueIds) && user.claimedMosqueIds.some(cid => String(cid).toLowerCase().trim() === String(mosqueId).toLowerCase().trim())) ||
      (user.claimedMosqueId && String(user.claimedMosqueId).toLowerCase().trim() === String(mosqueId).toLowerCase().trim())
    )
  );

  // Authorization:
  // Can EDIT if owner OR SUPER_ADMIN
  const isOwner = Boolean(user && answer.userId && (user.id === answer.userId || user.uid === answer.userId));
  const canEdit = Boolean(user && (isOwner || user.role === 'SUPER_ADMIN'));

  // Can DELETE if owner OR MODERATOR OR SUPER_ADMIN OR (MOSQUE_ADMIN of THIS mosque)
  const canDelete = Boolean(
    user && (
      isOwner ||
      user.role === 'MODERATOR' ||
      user.role === 'SUPER_ADMIN' ||
      isMosqueAdminForThisMosque
    )
  );

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    setSaving(true);
    setError('');
    try {
      await onUpdateAnswer?.(answer.id, editText.trim());
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update answer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this answer?')) return;
    setDeleting(true);
    try {
      await onDeleteAnswer?.(answer.id);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete answer');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={`p-3 rounded-xl text-sm transition-all ${
        isOfficial
          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60'
          : 'bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-gray-900 dark:text-white">
            {ansAuthor}
          </span>
          {isOfficial && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 size={10} /> Verified Mosque Admin
            </span>
          )}
        </div>
        <div className="flex items-center gap-2.5 text-[11px] text-gray-400">
          <span>{timeAgo(answer.createdAt)}</span>

          {/* Action buttons */}
          {user && !isEditing && (
            <div className="flex items-center gap-2 pl-1 border-l border-gray-200 dark:border-gray-700">
              {canEdit && (
                <button
                  type="button"
                  onClick={() => { setIsEditing(true); setEditText(ansText); }}
                  className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-0.5 cursor-pointer font-medium"
                  title="Edit answer"
                >
                  <Edit2 size={11} /> Edit
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-0.5 cursor-pointer font-medium disabled:opacity-50"
                  title="Delete answer"
                >
                  <Trash2 size={11} /> {deleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
              {!isOwner && (
                <button
                  type="button"
                  onClick={() => onFlagContent?.('ANSWER', answer.id)}
                  className="hover:text-rose-500 transition-colors flex items-center gap-0.5 cursor-pointer font-medium"
                  title="Report inappropriate answer"
                >
                  <Flag size={10} /> Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="mt-2 space-y-2">
          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
          )}
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={2}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-xs sm:text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium disabled:opacity-50 cursor-pointer"
            >
              <Check size={12} /> {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => { setIsEditing(false); setError(''); }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
            >
              <X size={12} /> Cancel
            </button>
          </div>
        </form>
      ) : (
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-xs sm:text-sm">{ansText}</p>
      )}
    </div>
  );
}

function QAItem({
  item,
  mosqueId,
  onAnswerQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onUpdateAnswer,
  onDeleteAnswer,
  onFlagContent,
}) {
  const { user } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);

  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editQuestionText, setEditQuestionText] = useState(item.questionText || item.question || '');
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState('');

  const questionText = item.questionText || item.question || '';
  const authorName = item.userDisplayName || item.userName || 'Community Worshipper';
  const answers = item.answers || [];

  const isMosqueAdminForThisMosque = Boolean(
    user && user.role === 'MOSQUE_ADMIN' && mosqueId && (
      (Array.isArray(user.claimedMosqueIds) && user.claimedMosqueIds.some(cid => String(cid).toLowerCase().trim() === String(mosqueId).toLowerCase().trim())) ||
      (user.claimedMosqueId && String(user.claimedMosqueId).toLowerCase().trim() === String(mosqueId).toLowerCase().trim())
    )
  );

  // Authorization:
  // Can EDIT question if owner OR SUPER_ADMIN
  const isOwner = Boolean(user && item.userId && (user.id === item.userId || user.uid === item.userId));
  const canEdit = Boolean(user && (isOwner || user.role === 'SUPER_ADMIN'));

  // Can DELETE question if owner OR MODERATOR OR SUPER_ADMIN OR (MOSQUE_ADMIN of THIS mosque)
  const canDelete = Boolean(
    user && (
      isOwner ||
      user.role === 'MODERATOR' ||
      user.role === 'SUPER_ADMIN' ||
      isMosqueAdminForThisMosque
    )
  );

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!editQuestionText.trim()) return;
    setSavingQuestion(true);
    setQuestionError('');
    try {
      await onUpdateQuestion?.(item.id, editQuestionText.trim());
      setIsEditingQuestion(false);
    } catch (err) {
      setQuestionError(err.response?.data?.message || err.message || 'Failed to update question');
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!window.confirm('Are you sure you want to delete this question and all its answers?')) return;
    setDeletingQuestion(true);
    try {
      await onDeleteQuestion?.(item.id);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete question');
    } finally {
      setDeletingQuestion(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !onAnswerQuestion) return;

    setSubmittingReply(true);
    try {
      await onAnswerQuestion(item.id, replyText.trim());
      setReplyText('');
      setShowReplyForm(false);
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Failed to submit answer');
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
      {/* Question Header */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-sky-100 dark:bg-sky-950/60 rounded-full flex items-center justify-center text-sky-700 dark:text-sky-300 text-xs font-bold shrink-0 border border-sky-200 dark:border-sky-800">
          Q
        </div>
        <div className="flex-1">
          {isEditingQuestion ? (
            <form onSubmit={handleSaveQuestion} className="mb-2 space-y-2">
              {questionError && (
                <p className="text-xs text-rose-600 dark:text-rose-400">{questionError}</p>
              )}
              <textarea
                value={editQuestionText}
                onChange={(e) => setEditQuestionText(e.target.value)}
                rows={2}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-xs sm:text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none resize-none"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={savingQuestion}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-medium disabled:opacity-50 cursor-pointer"
                >
                  <Check size={12} /> {savingQuestion ? 'Saving...' : 'Save Question'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsEditingQuestion(false); setQuestionError(''); }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                >
                  <X size={12} /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">{questionText}</p>
          )}

          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 flex-wrap">
            <span>{authorName} · {timeAgo(item.createdAt)}</span>

            {/* Question Management Actions */}
            {user && !isEditingQuestion && (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => { setIsEditingQuestion(true); setEditQuestionText(questionText); }}
                    className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                    title="Edit question"
                  >
                    <Edit2 size={11} /> Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={handleDeleteQuestion}
                    disabled={deletingQuestion}
                    className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer font-medium disabled:opacity-50"
                    title="Delete question"
                  >
                    <Trash2 size={11} /> {deletingQuestion ? 'Deleting...' : 'Delete'}
                  </button>
                )}
                {!isOwner && (
                  <button
                    type="button"
                    onClick={() => onFlagContent?.('QUESTION', item.id)}
                    className="hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                    title="Report inappropriate question"
                  >
                    <Flag size={11} /> Flag
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="mt-3 ml-11 space-y-3">
        {answers.length > 0 && (
          <div className="space-y-2.5">
            {answers.map((answer) => (
              <AnswerItem
                key={answer.id}
                answer={answer}
                mosqueId={mosqueId}
                onUpdateAnswer={onUpdateAnswer}
                onDeleteAnswer={onDeleteAnswer}
                onFlagContent={onFlagContent}
              />
            ))}
          </div>
        )}

        {/* Reply Action */}
        {user && !showReplyForm && (
          <button
            type="button"
            onClick={() => setShowReplyForm(true)}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            Reply with an answer
          </button>
        )}

        {/* Inline Answer Form */}
        {showReplyForm && (
          <form onSubmit={handleReplySubmit} className="mt-2 space-y-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Provide a helpful, accurate answer..."
              rows={2}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-xs sm:text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submittingReply}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium disabled:opacity-50 inline-flex items-center gap-1 cursor-pointer"
              >
                <Send size={11} /> {submittingReply ? 'Posting...' : 'Post Answer'}
              </button>
              <button
                type="button"
                onClick={() => { setShowReplyForm(false); setReplyText(''); }}
                className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function QASection({
  items = [],
  mosqueId,
  onSubmitQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onAnswerQuestion,
  onUpdateAnswer,
  onDeleteAnswer,
  onFlagContent,
}) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setErrorMessage('');
    setSubmitting(true);
    try {
      if (onSubmitQuestion) {
        await onSubmitQuestion(question.trim());
      }
      setQuestion('');
      setShowForm(false);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to submit question');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare size={18} className="text-sky-500" />
            Community Q&A ({items.length})
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Ask about facilities, prayers, sisters access, and Ramadan schedules
          </p>
        </div>

        {user && !showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
          >
            Ask a Question
          </button>
        )}
      </div>

      {/* Ask question form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800/80 rounded-xl p-4 mb-4 border border-sky-100 dark:border-sky-900/40 shadow-sm">
          {errorMessage && (
            <div className="p-3 mb-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{errorMessage}</span>
            </div>
          )}

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Is there dedicated parking during Friday Jumu'ah? Where is the women's entrance?"
            rows={3}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none resize-none"
          />

          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              {submitting ? 'Posting...' : 'Submit Question'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setErrorMessage(''); }}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Questions list */}
      {items.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <MessageSquare className="mx-auto text-gray-300 dark:text-gray-600 mb-2" size={32} />
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">No questions asked yet.</p>
          <p className="text-xs text-gray-400 mt-1">Have an inquiry about parking, timings, or facilities? Ask below!</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden shadow-sm">
          {items.map((item) => (
            <QAItem
              key={item.id}
              item={item}
              mosqueId={mosqueId}
              onAnswerQuestion={onAnswerQuestion}
              onUpdateQuestion={onUpdateQuestion}
              onDeleteQuestion={onDeleteQuestion}
              onUpdateAnswer={onUpdateAnswer}
              onDeleteAnswer={onDeleteAnswer}
              onFlagContent={onFlagContent}
            />
          ))}
        </div>
      )}
    </div>
  );
}
