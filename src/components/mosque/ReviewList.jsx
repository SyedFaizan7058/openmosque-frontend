import { useState } from 'react';
import { Star, ThumbsUp, MessageSquare, AlertCircle, Sparkles, Edit3, Trash2, Check, X } from 'lucide-react';
import { useAuth } from '../../hooks';
import { timeAgo } from '../../utils/helpers';

function StarRating({ rating = 0, onRate, interactive = false, size = 16 }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`${interactive ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            size={size}
            className={`${
              star <= (hover || rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewItem({ review, mosqueId, onUpdateReview, onDeleteReview }) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editOverall, setEditOverall] = useState(review.ratingOverall || review.rating || 5);
  const [editCleanliness, setEditCleanliness] = useState(review.ratingCleanliness || 5);
  const [editFacilities, setEditFacilities] = useState(review.ratingFacilities || 5);
  const [editParking, setEditParking] = useState(review.ratingParking || 4);
  const [editText, setEditText] = useState(review.reviewText || review.comment || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const authorName = review.userDisplayName || review.userName || 'Verified Worshipper';
  const text = review.reviewText || review.comment || '';
  const overall = review.ratingOverall || review.rating || 5;

  const isMosqueAdminForThisMosque = Boolean(
    user && user.role === 'MOSQUE_ADMIN' && mosqueId && (
      (Array.isArray(user.claimedMosqueIds) && user.claimedMosqueIds.some(cid => String(cid).toLowerCase().trim() === String(mosqueId).toLowerCase().trim())) ||
      (user.claimedMosqueId && String(user.claimedMosqueId).toLowerCase().trim() === String(mosqueId).toLowerCase().trim())
    )
  );

  // Authorization:
  // Can EDIT if owner OR SUPER_ADMIN
  const isOwner = Boolean(user && review.userId && (user.id === review.userId || user.uid === review.userId));
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

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    setSaving(true);
    setError('');
    try {
      await onUpdateReview?.(review.id, {
        ratingOverall: editOverall,
        ratingCleanliness: editCleanliness,
        ratingFacilities: editFacilities,
        ratingParking: editParking,
        reviewText: editText.trim(),
      });
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update review');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmPrompt = isOwner
      ? 'Are you sure you want to delete your review?'
      : `Moderate Content: Are you sure you want to delete ${authorName}'s review?`;

    if (!window.confirm(confirmPrompt)) return;

    setDeleting(true);
    try {
      await onDeleteReview?.(review.id);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete review');
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700/60 last:border-0 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-sm font-semibold border border-emerald-200 dark:border-emerald-800 shrink-0">
            {authorName[0]?.toUpperCase() || 'W'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{authorName}</p>
              {isOwner && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  You
                </span>
              )}
            </div>
            {!isEditing && (
              <div className="flex items-center gap-2 mt-0.5">
                <StarRating rating={overall} size={14} />
                <span className="text-xs font-semibold text-amber-500">{overall.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400">{timeAgo(review.createdAt)}</span>

          {/* Action buttons visible only to authorized users */}
          {!isEditing && (
            <div className="flex items-center gap-1 ml-1">
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Edit your review"
                >
                  <Edit3 size={14} />
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                  title={isOwner ? "Delete your review" : "Moderate & delete review"}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Form */}
      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 space-y-3 animate-in fade-in duration-150">
          {error && (
            <div className="p-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <span>Overall</span>
              <StarRating rating={editOverall} onRate={setEditOverall} interactive size={15} />
            </div>
            <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <span>Cleanliness</span>
              <StarRating rating={editCleanliness} onRate={setEditCleanliness} interactive size={15} />
            </div>
            <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <span>Facilities</span>
              <StarRating rating={editFacilities} onRate={setEditFacilities} interactive size={15} />
            </div>
          </div>

          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={2}
            required
            className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Check size={13} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => { setIsEditing(false); setError(''); }}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{text}</p>

          {/* Multi-category breakdown if provided */}
          {(review.ratingCleanliness || review.ratingFacilities || review.ratingParking) && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {review.ratingCleanliness && (
                <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  Cleanliness: <strong className="text-gray-900 dark:text-white">{review.ratingCleanliness}★</strong>
                </span>
              )}
              {review.ratingFacilities && (
                <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  Facilities: <strong className="text-gray-900 dark:text-white">{review.ratingFacilities}★</strong>
                </span>
              )}
              {review.ratingParking && (
                <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  Parking: <strong className="text-gray-900 dark:text-white">{review.ratingParking}★</strong>
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ReviewList({ reviews = [], ratingSummary, loading, onSubmitReview, onUpdateReview, onDeleteReview, mosqueId }) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Rating categories (Cleanliness, Facilities, Parking, Overall - Women's Area removed as requested)
  const [ratingOverall, setRatingOverall] = useState(5);
  const [ratingCleanliness, setRatingCleanliness] = useState(5);
  const [ratingFacilities, setRatingFacilities] = useState(5);
  const [ratingParking, setRatingParking] = useState(4);
  const [reviewText, setReviewText] = useState('');

  // Sort reviews newest first
  const sortedReviews = [...reviews].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const displayedReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, 3);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setErrorMessage('');
    setSubmitting(true);

    try {
      if (onSubmitReview) {
        await onSubmitReview({
          ratingOverall,
          ratingCleanliness,
          ratingFacilities,
          ratingParking,
          reviewText: reviewText.trim(),
        });
      }
      setReviewText('');
      setShowForm(false);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-100 dark:bg-gray-700/50 rounded-xl"></div>
          <div className="h-16 bg-gray-100 dark:bg-gray-700/50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header & Rating Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
              <Star size={18} className="text-amber-400 fill-amber-400" />
              Community Reviews ({reviews.length})
            </h3>
            {ratingSummary?.averageOverall && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                ★ {Number(ratingSummary.averageOverall).toFixed(1)}
              </span>
            )}
          </div>
          {ratingSummary ? (
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
              {ratingSummary.averageCleanliness != null && (
                <span>Cleanliness: <strong className="text-gray-900 dark:text-white font-bold">{Number(ratingSummary.averageCleanliness).toFixed(1)}★</strong></span>
              )}
              {ratingSummary.averageFacilities != null && (
                <span>Facilities: <strong className="text-gray-900 dark:text-white font-bold">{Number(ratingSummary.averageFacilities).toFixed(1)}★</strong></span>
              )}
              {ratingSummary.averageParking != null && (
                <span>Parking: <strong className="text-gray-900 dark:text-white font-bold">{Number(ratingSummary.averageParking).toFixed(1)}★</strong></span>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-1">No ratings yet.</p>
          )}
        </div>

        {user && !showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm self-start sm:self-auto cursor-pointer"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review submission form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800/80 rounded-2xl p-4 sm:p-5 mb-5 border border-emerald-100 dark:border-emerald-900/40 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
              <Sparkles size={16} className="text-emerald-500" />
              Rate & Review this Mosque
            </h4>
            <span className="text-xs text-gray-500">1 review per worshipper</span>
          </div>

          {errorMessage && (
            <div className="p-3 mb-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Clean 3-column / 2-column rating grid without Women's Area */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
            <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Overall</span>
              <StarRating rating={ratingOverall} onRate={setRatingOverall} interactive size={17} />
            </div>
            <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Cleanliness & Wudu</span>
              <StarRating rating={ratingCleanliness} onRate={setRatingCleanliness} interactive size={17} />
            </div>
            <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Facilities</span>
              <StarRating rating={ratingFacilities} onRate={setRatingFacilities} interactive size={17} />
            </div>
            <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 sm:col-span-3">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Parking Availability</span>
              <StarRating rating={ratingParking} onRate={setRatingParking} interactive size={17} />
            </div>
          </div>

          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share helpful feedback for fellow worshippers (e.g. atmosphere, accessibility, parking tips)..."
            rows={3}
            required
            className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-xs sm:text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
          />

          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-emerald-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Post Review'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setErrorMessage(''); }}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 text-center shadow-sm">
          <MessageSquare className="mx-auto text-gray-300 dark:text-gray-600 mb-2" size={32} />
          <p className="text-sm text-gray-600 dark:text-gray-300 font-bold">No reviews yet.</p>
          <p className="text-xs text-gray-400 mt-1">Be the first to share your experience with the community!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700/60 overflow-hidden shadow-sm">
            {displayedReviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                mosqueId={mosqueId}
                onUpdateReview={onUpdateReview}
                onDeleteReview={onDeleteReview}
              />
            ))}
          </div>

          {/* Show More / Show Less Button if > 3 reviews */}
          {reviews.length > 3 && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-sm"
              >
                {showAllReviews
                  ? 'Show Less Reviews'
                  : `Show More Reviews (${reviews.length - 3} more)`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
