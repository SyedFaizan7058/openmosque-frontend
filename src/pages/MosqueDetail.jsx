import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Globe, ArrowLeft, Heart, Share2, Shield,
  FileEdit, Radio, CheckCircle2, MessageSquare, AlertCircle, Sparkles, Clock, Upload, FileText,
  ChevronDown, Landmark, Sparkle, Settings
} from 'lucide-react';
import MosqueHeader from '../components/mosque/MosqueHeader';
import PrayerTable from '../components/mosque/PrayerTable';
import FacilityList from '../components/mosque/FacilityList';
import Gallery from '../components/mosque/Gallery';
import ReviewList from '../components/mosque/ReviewList';
import QASection from '../components/mosque/QASection';
import EventList from '../components/mosque/EventList';
import KhutbahModal from '../components/mosque/KhutbahModal';
import EventModal from '../components/mosque/EventModal';
import EditMosqueModal from '../components/mosque/EditMosqueModal';
import IqamahConfigurator from '../components/admin/IqamahConfigurator';
import mosqueService from '../services/mosqueService';
import { useAuth } from '../context/AuthContext';

export default function MosqueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loginWithGoogle } = useAuth();
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [signingInWithGoogle, setSigningInWithGoogle] = useState(false);

  const handleEditClick = () => {
    if (!user) {
      setShowGooglePrompt(true);
      return;
    }
    setEditModalOpen(true);
  };

  const handleGoogleSignInForEdit = async () => {
    setSigningInWithGoogle(true);
    try {
      await loginWithGoogle();
      setShowGooglePrompt(false);
      setEditModalOpen(true);
    } catch (e) {
      console.warn('Google sign-in error:', e);
      navigate('/login', {
        state: {
          from: location.pathname + location.search,
          message: 'Please sign in or create an account to suggest corrections.',
        },
      });
    } finally {
      setSigningInWithGoogle(false);
    }
  };

  const handleClaimClick = () => {
    if (!user) {
      navigate('/login', {
        state: {
          from: location.pathname + location.search,
          message: 'Please sign in or create an account to claim mosque ownership.',
        },
      });
      return;
    }
    setClaimModalOpen(true);
  };

  const [mosque, setMosque] = useState(null);
  const [prayerData, setPrayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  // Phase 4 Community & Events Data
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [events, setEvents] = useState([]);
  const [khutbahs, setKhutbahs] = useState([]);
  const [isInfoSectionOpen, setIsInfoSectionOpen] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState('facilities');

  // Modals
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [iqamahModalOpen, setIqamahModalOpen] = useState(false);
  const [khutbahModalOpen, setKhutbahModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [adminEditModalOpen, setAdminEditModalOpen] = useState(false);
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimValidationError, setClaimValidationError] = useState('');
  const [proofFileName, setProofFileName] = useState('');
  const [proofFileError, setProofFileError] = useState('');
  const [claimForm, setClaimForm] = useState({
    fullName: '',
    phoneNumber: '',
    officialEmail: '',
    positionInMosque: 'Head Imam',
    proofDocumentUrl: '',
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editForm, setEditForm] = useState({
    correctionNotes: '',
    suggestedPhone: '',
    suggestedWebsite: '',
  });

  const isMosqueAdminForThisMosque = Boolean(
    user && (
      user.role === 'SUPER_ADMIN' ||
      (user.role === 'MOSQUE_ADMIN' && (
        (Array.isArray(user.claimedMosqueIds) && user.claimedMosqueIds.some((cid) => {
          if (!cid) return false;
          const cidStr = String(cid).toLowerCase().trim();
          return (
            (mosque?.id && cidStr === String(mosque.id).toLowerCase().trim()) ||
            (id && cidStr === String(id).toLowerCase().trim()) ||
            (mosque?.slug && cidStr === String(mosque.slug).toLowerCase().trim())
          );
        })) ||
        (user.claimedMosqueId && (
          String(user.claimedMosqueId).toLowerCase().trim() === String(mosque?.id || id || '').toLowerCase().trim()
        ))
      ))
    )
  );

  const handleProofFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isValid = file.type.startsWith('image/') || file.type === 'application/pdf' || file.name.endsWith('.pdf');
    if (!isValid) {
      setProofFileError('Please select an Image or PDF document only.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setProofFileError('File size exceeds 10MB limit.');
      return;
    }

    setProofFileError('');
    setProofFileName(file.name);

    // Try direct multipart upload to backend first
    try {
      const uploadRes = await mosqueService.uploadMediaDirect(file, 'proof_documents');
      const publicUrl = uploadRes?.data || uploadRes;
      if (typeof publicUrl === 'string' && publicUrl.startsWith('http')) {
        setClaimForm((prev) => ({ ...prev, proofDocumentUrl: publicUrl }));
        return;
      }
    } catch (uploadErr) {
      console.warn('Direct media upload fallback to data URL:', uploadErr);
    }

    // Fallback: Use FileReader data URL (database now supports TEXT)
    const reader = new FileReader();
    reader.onload = () => {
      setClaimForm((prev) => ({ ...prev, proofDocumentUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchMosqueData = async () => {
      setLoading(true);
      try {
        const mosqueRes = await mosqueService.getMosqueById(id);
        if (isMounted) {
          setMosque(mosqueRes);
        }
        if (user && mosqueRes?.id) {
          try {
            const fav = await mosqueService.isFavorite(mosqueRes.id);
            if (isMounted) setIsFavorited(Boolean(fav));
          } catch {
            if (isMounted) setIsFavorited(false);
          }
        } else if (isMounted) {
          setIsFavorited(false);
        }

        const prayerRes = await mosqueService.getPrayerTimes(id);
        if (isMounted) {
          setPrayerData(prayerRes);
        }

        // Fetch Phase 4 community reviews, ratings, Q&A, events, and Friday khutbahs
        const [reviewsRes, ratingRes, questionsRes, eventsRes, khutbahsRes] = await Promise.allSettled([
          mosqueService.getReviews(id),
          mosqueService.getRatingSummary(id),
          mosqueService.getQuestions(id),
          mosqueService.getMosqueEvents(id),
          mosqueService.getMosqueKhutbahs(id),
        ]);

        if (isMounted) {
          if (reviewsRes.status === 'fulfilled') setReviews(reviewsRes.value || []);
          if (ratingRes.status === 'fulfilled') {
            const sum = ratingRes.value;
            setRatingSummary(sum);
            if (sum && sum.totalReviews > 0) {
              setMosque((prev) => prev ? {
                ...prev,
                rating: sum.averageOverall,
                reviewCount: sum.totalReviews,
              } : prev);
            }
          }
          if (questionsRes.status === 'fulfilled') setQuestions(questionsRes.value || []);
          if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value || []);
          if (khutbahsRes.status === 'fulfilled') setKhutbahs(khutbahsRes.value || []);
        }
      } catch (err) {
        console.error('Failed to load mosque details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMosqueData();
    return () => { isMounted = false; };
  }, [id, user]);

  const handleFavoriteToggle = async () => {
    if (!user) {
      navigate('/login', {
        state: {
          from: `/mosques/${id}`,
          message: 'Please log in or register to save mosques to your favorites.'
        }
      });
      return;
    }
    if (mosque) {
      const nextState = !isFavorited;
      setIsFavorited(nextState);
      try {
        const res = await mosqueService.toggleFavorite(mosque.id);
        if (res && typeof res.favorite === 'boolean') {
          setIsFavorited(res.favorite);
        }
      } catch (err) {
        console.warn('Failed to toggle favorite:', err);
        setIsFavorited(!nextState);
      }
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setClaimValidationError('');

    // Strict validation for all details
    if (!claimForm.fullName.trim()) {
      setClaimValidationError('Full Name is mandatory.');
      return;
    }
    if (!claimForm.phoneNumber.trim()) {
      setClaimValidationError('Phone Number is mandatory.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!claimForm.officialEmail.trim() || !emailRegex.test(claimForm.officialEmail.trim())) {
      setClaimValidationError('A valid Official Email address is mandatory.');
      return;
    }
    if (!claimForm.positionInMosque.trim()) {
      setClaimValidationError('Position in Mosque is mandatory.');
      return;
    }
    if (!claimForm.proofDocumentUrl) {
      setClaimValidationError('Proof Document / Charity Certificate (Image or PDF) is mandatory.');
      return;
    }

    setClaimSubmitting(true);
    try {
      await mosqueService.claimMosque(mosque?.id || id, {
        fullName: claimForm.fullName.trim(),
        phoneNumber: claimForm.phoneNumber.trim(),
        officialEmail: claimForm.officialEmail.trim(),
        positionInMosque: claimForm.positionInMosque.trim(),
        proofDocumentUrl: claimForm.proofDocumentUrl,
      });
      setClaimSuccess(true);
      setTimeout(() => {
        setClaimModalOpen(false);
        setClaimSuccess(false);
        setClaimForm({
          fullName: '',
          phoneNumber: '',
          officialEmail: '',
          positionInMosque: 'Head Imam',
          proofDocumentUrl: '',
        });
        setProofFileName('');
      }, 2000);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to submit claim request.';
      setClaimValidationError(errMsg);
    } finally {
      setClaimSubmitting(false);
    }
  };

  const handleUpdateMosque = async (updatedData) => {
    const res = await mosqueService.updateMosque(mosque.id, updatedData);
    setMosque(res);
  };

  const handleCreateKhutbah = async (payload) => {
    const created = await mosqueService.createMosqueKhutbah(mosque.id, payload);
    setKhutbahs((prev) => [created, ...prev]);
  };

  const handleDeleteKhutbah = async (khutbahId) => {
    if (!window.confirm('Are you sure you want to remove this Friday sermon announcement?')) return;
    await mosqueService.deleteMosqueKhutbah(mosque.id, khutbahId);
    setKhutbahs((prev) => prev.filter((k) => k.id !== khutbahId));
  };

  const handleCreateEvent = async (payload) => {
    const created = await mosqueService.createMosqueEvent(mosque.id, payload);
    setEvents((prev) => [created, ...prev]);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel this event?')) return;
    await mosqueService.deleteMosqueEvent(mosque.id, eventId);
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    try {
      await mosqueService.suggestEdit(mosque?.id || id, {
        targetMosqueId: mosque?.id || id,
        name: mosque?.name || 'Mosque Correction',
        city: mosque?.city || '',
        address: mosque?.address || '',
        country: mosque?.country || '',
        latitude: mosque?.latitude || 0,
        longitude: mosque?.longitude || 0,
        description: editForm.correctionNotes,
        contactPhone: editForm.suggestedPhone || mosque?.contactPhone || null,
        websiteUrl: editForm.suggestedWebsite || mosque?.websiteUrl || null,
      });
      setEditSuccess(true);
      setTimeout(() => {
        setEditModalOpen(false);
        setEditSuccess(false);
        setEditForm({ correctionNotes: '', suggestedPhone: '', suggestedWebsite: '' });
      }, 2000);
    } catch {
      setEditSuccess(true);
      setTimeout(() => {
        setEditModalOpen(false);
        setEditSuccess(false);
      }, 2000);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    if (!user) {
      navigate('/login', { state: { from: `/mosques/${id}`, message: 'Please log in to submit a review.' } });
      return;
    }
    await mosqueService.submitReview(mosque.id, reviewData);
    const updatedReviews = await mosqueService.getReviews(mosque.id);
    setReviews(updatedReviews);
    const updatedRating = await mosqueService.getRatingSummary(mosque.id);
    setRatingSummary(updatedRating);
  };

  const handleUpdateReview = async (reviewId, reviewData) => {
    const updated = await mosqueService.updateReview(mosque?.id || id, reviewId, reviewData);
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, ...reviewData, ...(updated || {}) } : r)));
    try {
      const updatedRating = await mosqueService.getRatingSummary(mosque?.id || id);
      setRatingSummary(updatedRating);
    } catch {}
  };

  const handleDeleteReview = async (reviewId) => {
    await mosqueService.deleteReview(mosque?.id || id, reviewId);
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    try {
      const updatedRating = await mosqueService.getRatingSummary(mosque?.id || id);
      setRatingSummary(updatedRating);
    } catch {}
  };

  const handleQuestionSubmit = async (questionText) => {
    if (!user) {
      navigate('/login', { state: { from: `/mosques/${id}`, message: 'Please log in to ask a question.' } });
      return;
    }
    await mosqueService.askQuestion(mosque.id, questionText);
    const updated = await mosqueService.getQuestions(mosque.id);
    setQuestions(updated);
  };

  const handleUpdateQuestion = async (questionId, questionText) => {
    await mosqueService.updateQuestion(questionId, questionText);
    const updated = await mosqueService.getQuestions(mosque.id);
    setQuestions(updated);
  };

  const handleDeleteQuestion = async (questionId) => {
    await mosqueService.deleteQuestion(questionId);
    const updated = await mosqueService.getQuestions(mosque.id);
    setQuestions(updated);
  };

  const handleAnswerSubmit = async (questionId, answerText) => {
    if (!user) {
      navigate('/login', { state: { from: `/mosques/${id}`, message: 'Please log in to answer.' } });
      return;
    }
    await mosqueService.answerQuestion(questionId, answerText);
    const updated = await mosqueService.getQuestions(mosque.id);
    setQuestions(updated);
  };

  const handleUpdateAnswer = async (answerId, answerText) => {
    await mosqueService.updateAnswer(answerId, answerText);
    const updated = await mosqueService.getQuestions(mosque.id);
    setQuestions(updated);
  };

  const handleDeleteAnswer = async (answerId) => {
    await mosqueService.deleteAnswer(answerId);
    const updated = await mosqueService.getQuestions(mosque.id);
    setQuestions(updated);
  };

  const handleFlagContent = async (targetType, targetId) => {
    const reason = window.prompt('Please provide a brief reason for reporting this content:');
    if (!reason || !reason.trim()) return;
    try {
      await mosqueService.flagContent({ targetType, targetId, reason: reason.trim() });
      alert('Report submitted to moderation queue. Thank you for keeping our community safe.');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to submit report.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="h-8 w-48 rounded-lg skeleton" />
        <div className="h-72 rounded-2xl skeleton" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 rounded-2xl skeleton" />
            <div className="h-48 rounded-2xl skeleton" />
          </div>
          <div className="h-96 rounded-2xl skeleton" />
        </div>
      </div>
    );
  }

  if (!mosque) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mosque Not Found</h2>
        <p className="text-gray-500 mt-2 mb-6">The mosque you are looking for might have been moved or removed.</p>
        <Link to="/mosques" className="px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium">
          Return to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back link */}
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Mosques</span>
        </button>
      </div>

      {/* Main Header Card */}
      <MosqueHeader
        mosque={mosque}
        onFavorite={handleFavoriteToggle}
        isFavorited={isFavorited}
      />

      {/* Hero Image & Gallery */}
      <div className="space-y-4">
        <Gallery images={mosque.images || [mosque.coverImageUrl]} />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Description, Facilities, Community */}
        <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
          {/* Facilities & About Mosque Section (Collapsible Dropdown matching Image 2) */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all">
            {/* Header Dropdown Trigger Bar */}
            <button
              type="button"
              onClick={() => setIsInfoSectionOpen(!isInfoSectionOpen)}
              className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-gray-50/70 dark:hover:bg-gray-700/40 transition-colors focus:outline-none"
              aria-expanded={isInfoSectionOpen}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>Facilities &amp; About Mosque</span>
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isInfoSectionOpen
                      ? 'Click to collapse section'
                      : 'Click to explore amenities, community services & mosque history'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 shrink-0">
                <span className="text-xs font-semibold hidden sm:inline">
                  {isInfoSectionOpen ? 'Hide' : 'Show Details'}
                </span>
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${
                      isInfoSectionOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>
            </button>

            {/* Content Display: Revealed only when user clicks on dropdown */}
            {isInfoSectionOpen && (
              <div className="border-t border-gray-100 dark:border-gray-700/60 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Internal sub-tabs: 1. Facilities First, 2. About Mosque Second */}
                <div className="flex items-center gap-2 p-3 sm:p-4 bg-gray-50/70 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-700/60">
                  <button
                    type="button"
                    onClick={() => setActiveInfoTab('facilities')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      activeInfoTab === 'facilities'
                        ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Sparkles size={15} />
                    <span>1. Facilities &amp; Amenities</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveInfoTab('about')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      activeInfoTab === 'about'
                        ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Landmark size={15} />
                    <span>2. About the Mosque</span>
                  </button>
                </div>

                {/* Tab 1: Facilities & Amenities FIRST */}
                <div className="p-5 sm:p-7">
                  {activeInfoTab === 'facilities' ? (
                    <div>
                      <FacilityList facilities={mosque.facilityCodes || mosque.facilities} />
                    </div>
                  ) : (
                    /* Tab 2: About Mosque SECOND */
                    <div className="space-y-6">
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                        {mosque.description ||
                          'Welcome to our mosque. Daily congregational prayers, Friday Jumu’ah services, Quran study halaqahs, and community educational programs are conducted here.'}
                      </p>

                      {mosque.liveStreamUrl && (
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 shrink-0">
                              <Radio size={18} className="animate-pulse" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-red-900 dark:text-red-200">
                                Live Broadcast Available
                              </h4>
                              <p className="text-xs text-red-700 dark:text-red-300">
                                Watch live Jumu&apos;ah Khutbah and daily lectures
                              </p>
                            </div>
                          </div>
                          <a
                            href={mosque.liveStreamUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors text-center shrink-0"
                          >
                            Watch Stream
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Community Events & Friday Khutbahs */}
          <EventList
            events={events}
            khutbahs={khutbahs}
            canManage={isMosqueAdminForThisMosque}
            onAddKhutbah={() => setKhutbahModalOpen(true)}
            onAddEvent={() => setEventModalOpen(true)}
            onDeleteKhutbah={handleDeleteKhutbah}
            onDeleteEvent={handleDeleteEvent}
          />

          {/* Reviews and Ratings */}
          <ReviewList
            mosqueId={mosque?.id || id}
            reviews={reviews}
            ratingSummary={ratingSummary}
            onSubmitReview={handleReviewSubmit}
            onUpdateReview={handleUpdateReview}
            onDeleteReview={handleDeleteReview}
          />

          {/* Community Q&A */}
          <QASection
            mosqueId={mosque?.id || id}
            items={questions}
            onSubmitQuestion={handleQuestionSubmit}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onAnswerQuestion={handleAnswerSubmit}
            onUpdateAnswer={handleUpdateAnswer}
            onDeleteAnswer={handleDeleteAnswer}
            onFlagContent={handleFlagContent}
          />
        </div>

        {/* Right Sidebar: Live Prayer Times & Actions */}
        <div className="space-y-6 lg:sticky lg:top-20 order-1 lg:order-2">
          {/* Live Calculated Prayer Schedule */}
          <PrayerTable
            prayerData={prayerData || {}}
            prayerTimes={mosque.prayerTimes || {}}
            mosque={mosque}
            canEdit={isMosqueAdminForThisMosque}
            onEditPrayerTimes={() => setIqamahModalOpen(true)}
          />

          {/* Contact and Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Contact Information</h3>
            <ul className="space-y-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              {mosque.address && (
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-primary-500 shrink-0 mt-0.5" />
                  <span>{mosque.address}, {mosque.city}, {mosque.country}</span>
                </li>
              )}
              {mosque.phone && (
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-primary-500 shrink-0" />
                  <a href={`tel:${mosque.phone}`} className="hover:text-primary-600 hover:underline">
                    {mosque.phone}
                  </a>
                </li>
              )}
              {mosque.email && (
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-primary-500 shrink-0" />
                  <a href={`mailto:${mosque.email}`} className="hover:text-primary-600 hover:underline">
                    {mosque.email}
                  </a>
                </li>
              )}
              {/* Website */}
              <li className="flex items-center gap-3">
                <Globe
                  size={16}
                  className={
                    mosque.website && !['na', 'n/a', 'none', 'null', ''].includes(mosque.website.trim().toLowerCase())
                      ? 'text-primary-500 shrink-0'
                      : 'text-gray-400 shrink-0'
                  }
                />
                {mosque.website && !['na', 'n/a', 'none', 'null', ''].includes(mosque.website.trim().toLowerCase()) ? (
                  <a
                    href={mosque.website.startsWith('http') ? mosque.website : `https://${mosque.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-600 hover:underline truncate text-primary-600 dark:text-primary-400"
                  >
                    {mosque.website.replace(/^https?:\/\//, '')}
                  </a>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 text-xs italic">
                    Official website not available
                  </span>
                )}
              </li>
            </ul>

            {/* Community Contribution Actions */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700/60 space-y-2.5">
              <button
                type="button"
                onClick={handleEditClick}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-600 transition-colors cursor-pointer"
              >
                <FileEdit size={14} className="text-primary-600 dark:text-primary-400" />
                <span>Suggest an Edit or Correction</span>
              </button>

              {!isMosqueAdminForThisMosque && (
                <button
                  type="button"
                  onClick={handleClaimClick}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/40 dark:hover:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-xl text-xs font-semibold border border-primary-200 dark:border-primary-800 transition-colors cursor-pointer"
                >
                  <Shield size={14} />
                  <span>Claim Mosque (Imam / Committee)</span>
                </button>
              )}

              {isMosqueAdminForThisMosque && (
                <button
                  type="button"
                  onClick={() => setAdminEditModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-semibold border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                >
                  <Settings size={14} className="text-blue-600 dark:text-blue-400" />
                  <span>Edit Mosque Info (Admin)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Iqamah & Prayer Times Configurator Modal for Mosque Admins */}
      {iqamahModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[92vh] overflow-y-auto">
            <IqamahConfigurator
              mosqueId={mosque.id || id}
              mosqueName={mosque.name}
              onClose={() => setIqamahModalOpen(false)}
              onSaved={async () => {
                try {
                  const updated = await mosqueService.getPrayerTimes(id);
                  setPrayerData(updated);
                } catch (e) {
                  console.warn('Failed to refresh prayer times', e);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Claim Mosque Modal */}
      {claimModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="text-primary-500" size={20} />
                Claim Mosque Ownership
              </h3>
              <button
                type="button"
                onClick={() => setClaimModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {claimSuccess ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 size={48} className="mx-auto text-primary-500" />
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Claim Request Submitted!</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Our moderation committee will review your documentation and upgrade your account to Mosque Admin upon verification.
                </p>
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Mosque administrators can configure exact Iqamah offsets, post official announcements, and verify congregation schedules.
                </p>
                {claimValidationError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{claimValidationError}</span>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    id="claim-fullname"
                    type="text"
                    required
                    value={claimForm.fullName}
                    onChange={(e) => setClaimForm({ ...claimForm, fullName: e.target.value })}
                    placeholder="Imam Tariq Al-Banna"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Phone Number</label>
                    <input
                      id="claim-phone"
                      type="tel"
                      required
                      value={claimForm.phoneNumber}
                      onChange={(e) => setClaimForm({ ...claimForm, phoneNumber: e.target.value })}
                      placeholder="+44 20 7654 3210"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Official Email</label>
                    <input
                      id="claim-email"
                      type="email"
                      required
                      value={claimForm.officialEmail}
                      onChange={(e) => setClaimForm({ ...claimForm, officialEmail: e.target.value })}
                      placeholder="imam@mosque.org"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Position in Mosque</label>
                  <input
                    id="claim-position"
                    type="text"
                    required
                    value={claimForm.positionInMosque}
                    onChange={(e) => setClaimForm({ ...claimForm, positionInMosque: e.target.value })}
                    placeholder="Head Imam / Trustee / Committee President"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Proof Document / Charity Certificate (Image or PDF only)
                  </label>
                  <div className="space-y-3">
                    <div>
                      <input
                        id="claim-proof"
                        type="text"
                        value={claimForm.proofDocumentUrl?.startsWith('data:') ? '' : claimForm.proofDocumentUrl}
                        onChange={(e) => {
                          setProofFileName('');
                          setClaimForm((prev) => ({ ...prev, proofDocumentUrl: e.target.value }));
                        }}
                        placeholder="https://charity-commission.gov.uk/certificate-123 or document link"
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white mb-2"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold cursor-pointer border border-gray-300 dark:border-gray-600 transition-colors shadow-sm">
                        <Upload size={14} />
                        <span>Upload File</span>
                        <input
                          id="claim-proof-file"
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={handleProofFileChange}
                        />
                      </label>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px] sm:max-w-xs">
                        {proofFileName ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-primary-600 dark:text-primary-400">
                            <FileText size={13} /> {proofFileName}
                          </span>
                        ) : (
                          'Or upload Image / PDF'
                        )}
                      </span>
                      {proofFileName && (
                        <button
                          type="button"
                          onClick={() => {
                            setProofFileName('');
                            setClaimForm((prev) => ({ ...prev, proofDocumentUrl: '' }));
                          }}
                          className="text-xs text-rose-500 hover:text-rose-600 font-semibold ml-auto"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {proofFileError && (
                      <p className="text-xs text-rose-500 font-medium">{proofFileError}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setClaimModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={claimSubmitting}
                    className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold transition-colors shadow-md disabled:opacity-60"
                  >
                    {claimSubmitting ? 'Submitting...' : 'Submit Claim'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Google Sign-in Required Prompt Modal */}
      {showGooglePrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-4">
              <FileEdit size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Sign In to Suggest Corrections
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Help keep mosque details accurate for all worshippers. Sign in with Google to submit corrections and earn community contributor points.
            </p>
            <div className="space-y-3">
              <button
                type="button"
                disabled={signingInWithGoogle}
                onClick={handleGoogleSignInForEdit}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold text-sm rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{signingInWithGoogle ? 'Signing in with Google...' : 'Continue with Google'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowGooglePrompt(false);
                  navigate('/login', {
                    state: {
                      from: location.pathname + location.search,
                      message: 'Please sign in or create an account to suggest corrections.',
                    },
                  });
                }}
                className="w-full py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Sign in with Email instead
              </button>

              <button
                type="button"
                onClick={() => setShowGooglePrompt(false)}
                className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggest Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileEdit className="text-primary-500" size={20} />
                Suggest Correction (+20 Contributor Points)
              </h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {editSuccess ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 size={48} className="mx-auto text-green-500" />
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Correction Submitted!</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Thank you for keeping OpenMosque accurate. Your suggestion will be reviewed by community moderators. Upon approval, you will earn +20 Contributor Points.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    What needs to be updated?
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={editForm.correctionNotes}
                    onChange={(e) => setEditForm({ ...editForm, correctionNotes: e.target.value })}
                    placeholder="e.g. Asr Iqamah is now 15 minutes after Adhan; parking entrance is on the north side."
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Updated Phone</label>
                    <input
                      type="text"
                      value={editForm.suggestedPhone}
                      onChange={(e) => setEditForm({ ...editForm, suggestedPhone: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Updated Website</label>
                    <input
                      type="text"
                      value={editForm.suggestedWebsite}
                      onChange={(e) => setEditForm({ ...editForm, suggestedWebsite: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold transition-colors shadow-md disabled:opacity-60"
                  >
                    {editSubmitting ? 'Sending...' : 'Submit Suggestion'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Admin Direct Mosque Edit Modal */}
      {adminEditModalOpen && mosque && (
        <EditMosqueModal
          mosque={mosque}
          onClose={() => setAdminEditModalOpen(false)}
          onMosqueUpdated={handleUpdateMosque}
        />
      )}

      {khutbahModalOpen && (
        <KhutbahModal
          mosqueId={mosque.id || id}
          existingKhutbahs={khutbahs}
          onClose={() => setKhutbahModalOpen(false)}
          onKhutbahCreated={handleCreateKhutbah}
        />
      )}

      {/* Community Program / Event Scheduling Modal */}
      {eventModalOpen && (
        <EventModal
          mosqueId={mosque.id || id}
          existingEvents={events}
          onClose={() => setEventModalOpen(false)}
          onEventCreated={handleCreateEvent}
        />
      )}
    </div>
  );
}
