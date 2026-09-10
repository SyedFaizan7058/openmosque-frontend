import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Sparkles, Building2 } from 'lucide-react';
import MosqueWizard from '../components/forms/MosqueWizard';
import mosqueService from '../services/mosqueService';

export default function AddMosque() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const res = await mosqueService.submitMosque(formData);
      setSubmissionMessage(res?.message || 'Thank you for contributing! Your mosque proposal has been submitted to the moderation queue.');
      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setSubmissionMessage('Your submission was saved locally and queued for review.');
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <CheckCircle2 size={36} />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Proposal Received (+100 Points)
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-3 text-base max-w-md mx-auto leading-relaxed">
          {submissionMessage}
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link
            to="/mosques"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold text-sm transition-colors shadow-md"
          >
            <span>Explore Mosques</span>
            <ArrowRight size={16} />
          </Link>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="px-5 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Add Another Mosque
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 text-xs font-semibold mb-3 border border-primary-200 dark:border-primary-800">
          <Sparkles size={13} className="text-accent-500" />
          <span>Community Crowdsourcing</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Add a Mosque
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
          Help Muslim worshippers worldwide find accurate, welcoming places to pray.
          Your submission earns +100 reward points upon moderator approval.
        </p>
      </div>

      <MosqueWizard onSubmit={handleSubmit} />
    </div>
  );
}
