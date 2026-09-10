import { useState } from 'react';
import { ChevronRight, Check, AlertCircle } from 'lucide-react';
import BasicInfoForm from './BasicInfoForm';
import FacilityForm from './FacilityForm';
import PrayerForm from './PrayerForm';
import PhotoUpload from './PhotoUpload';

const STEPS = [
  { id: 1, title: 'Basic Information' },
  { id: 2, title: 'Facilities' },
  { id: 3, title: 'Prayer Timings' },
  { id: 4, title: 'Photos & Submit' },
];

export default function MosqueWizard({ onSubmit }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    country: '',
    lat: null,
    lng: null,
    description: '',
    phone: '',
    email: '',
    website: '',
    facilities: [],
    prayerTimes: {},
    photos: [],
  });
  const [errors, setErrors] = useState({});

  const updateForm = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Mosque name is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city?.trim()) newErrors.city = 'City is required';
      if (!formData.country?.trim()) newErrors.country = 'Country is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    onSubmit?.(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep > step.id
                    ? 'bg-primary-500 text-white'
                    : currentStep === step.id
                    ? 'bg-primary-500 text-white ring-4 ring-primary-100 dark:ring-primary-900'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                {currentStep > step.id ? <Check size={14} /> : step.id}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {step.title}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`hidden sm:block w-12 h-0.5 mx-2 ${
                currentStep > step.id ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Form content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        {currentStep === 1 && <BasicInfoForm data={formData} onChange={updateForm} errors={errors} />}
        {currentStep === 2 && <FacilityForm data={formData} onChange={updateForm} />}
        {currentStep === 3 && <PrayerForm data={formData} onChange={updateForm} />}
        {currentStep === 4 && <PhotoUpload data={formData} onChange={updateForm} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Back
        </button>
        <div className="flex items-center gap-2">
          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1 px-6 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors cursor-pointer"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-1 px-6 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors cursor-pointer"
            >
              Submit for Review
            </button>
          )}
        </div>
      </div>

      {/* Submission notice */}
      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-start gap-2">
        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Your submission will be reviewed before publication. This helps us maintain accurate mosque information.
        </p>
      </div>
    </div>
  );
}
