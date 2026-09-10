import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Save, AlertCircle, RefreshCw } from 'lucide-react';
import mosqueService from '../../services/mosqueService';

const PRAYERS = [
  { key: 'fajr', label: 'Fajr', defaultAdhan: '05:00', defaultFixed: '05:30', defaultOffset: 20 },
  { key: 'dhuhr', label: 'Dhuhr', defaultAdhan: '12:30', defaultFixed: '13:30', defaultOffset: 15 },
  { key: 'asr', label: 'Asr', defaultAdhan: '16:00', defaultFixed: '17:00', defaultOffset: 15 },
  { key: 'maghrib', label: 'Maghrib', defaultAdhan: '18:45', defaultFixed: '19:00', defaultOffset: 0 },
  { key: 'isha', label: 'Isha', defaultAdhan: '20:15', defaultFixed: '21:15', defaultOffset: 15 },
];

export default function IqamahConfigurator({ mosqueId, mosqueName = 'Selected Mosque', onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Default: Adhan to AUTO (astronomical calculation), Iqamah strictly to OFFSET_AFTER_ADHAN
  const [form, setForm] = useState({
    fajrAdhanMode: 'AUTO',
    fajrAdhanTime: '',
    fajrType: 'OFFSET_AFTER_ADHAN',
    fajrOffsetMinutes: 20,
    fajrFixedTime: '05:30',

    dhuhrAdhanMode: 'AUTO',
    dhuhrAdhanTime: '',
    dhuhrType: 'OFFSET_AFTER_ADHAN',
    dhuhrOffsetMinutes: 15,
    dhuhrFixedTime: '13:30',

    asrAdhanMode: 'AUTO',
    asrAdhanTime: '',
    asrType: 'OFFSET_AFTER_ADHAN',
    asrOffsetMinutes: 15,
    asrFixedTime: '17:00',

    maghribAdhanMode: 'AUTO',
    maghribAdhanTime: '',
    maghribType: 'OFFSET_AFTER_ADHAN',
    maghribOffsetMinutes: 0,
    maghribFixedTime: '19:00',

    ishaAdhanMode: 'AUTO',
    ishaAdhanTime: '',
    ishaType: 'OFFSET_AFTER_ADHAN',
    ishaOffsetMinutes: 15,
    ishaFixedTime: '21:15',

    jummah1Time: '13:15',
    jummah2Time: '',
    jummahKhutbahLanguage: 'Arabic',
  });

  useEffect(() => {
    if (!mosqueId) return;
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const data = await mosqueService.getMosqueIqamahSchedule(mosqueId);
        if (isMounted && data) {
          setForm({
            fajrAdhanMode: data.fajrAdhanTime ? 'CUSTOM' : 'AUTO',
            fajrAdhanTime: data.fajrAdhanTime ? data.fajrAdhanTime.slice(0, 5) : '',
            fajrType: data.fajrType || 'OFFSET_AFTER_ADHAN',
            fajrOffsetMinutes: data.fajrOffsetMinutes ?? 20,
            fajrFixedTime: data.fajrFixedTime ? data.fajrFixedTime.slice(0, 5) : '05:30',

            dhuhrAdhanMode: data.dhuhrAdhanTime ? 'CUSTOM' : 'AUTO',
            dhuhrAdhanTime: data.dhuhrAdhanTime ? data.dhuhrAdhanTime.slice(0, 5) : '',
            dhuhrType: data.dhuhrType || 'OFFSET_AFTER_ADHAN',
            dhuhrOffsetMinutes: data.dhuhrOffsetMinutes ?? 15,
            dhuhrFixedTime: data.dhuhrFixedTime ? data.dhuhrFixedTime.slice(0, 5) : '13:30',

            asrAdhanMode: data.asrAdhanTime ? 'CUSTOM' : 'AUTO',
            asrAdhanTime: data.asrAdhanTime ? data.asrAdhanTime.slice(0, 5) : '',
            asrType: data.asrType || 'OFFSET_AFTER_ADHAN',
            asrOffsetMinutes: data.asrOffsetMinutes ?? 15,
            asrFixedTime: data.asrFixedTime ? data.asrFixedTime.slice(0, 5) : '17:00',

            maghribAdhanMode: data.maghribAdhanTime ? 'CUSTOM' : 'AUTO',
            maghribAdhanTime: data.maghribAdhanTime ? data.maghribAdhanTime.slice(0, 5) : '',
            maghribType: data.maghribType || 'OFFSET_AFTER_ADHAN',
            maghribOffsetMinutes: data.maghribOffsetMinutes ?? 0,
            maghribFixedTime: data.maghribFixedTime ? data.maghribFixedTime.slice(0, 5) : '19:00',

            ishaAdhanMode: data.ishaAdhanTime ? 'CUSTOM' : 'AUTO',
            ishaAdhanTime: data.ishaAdhanTime ? data.ishaAdhanTime.slice(0, 5) : '',
            ishaType: data.ishaType || 'OFFSET_AFTER_ADHAN',
            ishaOffsetMinutes: data.ishaOffsetMinutes ?? 15,
            ishaFixedTime: data.ishaFixedTime ? data.ishaFixedTime.slice(0, 5) : '21:15',

            jummah1Time: data.jummah1Time ? data.jummah1Time.slice(0, 5) : '13:15',
            jummah2Time: data.jummah2Time && data.jummah2Time !== 'null' ? data.jummah2Time.slice(0, 5) : '',
            jummahKhutbahLanguage: data.jummahKhutbahLanguage || 'Arabic',
          });
        }
      } catch {
        if (isMounted) setErrorMsg('Could not load existing schedule. Showing standard defaults.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [mosqueId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      fajrAdhanTime: form.fajrAdhanMode === 'CUSTOM' && form.fajrAdhanTime ? `${form.fajrAdhanTime.slice(0, 5)}:00` : null,
      fajrType: form.fajrType || 'OFFSET_AFTER_ADHAN',
      fajrOffsetMinutes: Number(form.fajrOffsetMinutes ?? 20),
      fajrFixedTime: form.fajrType === 'FIXED_TIME' && form.fajrFixedTime ? `${form.fajrFixedTime.slice(0, 5)}:00` : null,

      dhuhrAdhanTime: form.dhuhrAdhanMode === 'CUSTOM' && form.dhuhrAdhanTime ? `${form.dhuhrAdhanTime.slice(0, 5)}:00` : null,
      dhuhrType: form.dhuhrType || 'OFFSET_AFTER_ADHAN',
      dhuhrOffsetMinutes: Number(form.dhuhrOffsetMinutes ?? 15),
      dhuhrFixedTime: form.dhuhrType === 'FIXED_TIME' && form.dhuhrFixedTime ? `${form.dhuhrFixedTime.slice(0, 5)}:00` : null,

      asrAdhanTime: form.asrAdhanMode === 'CUSTOM' && form.asrAdhanTime ? `${form.asrAdhanTime.slice(0, 5)}:00` : null,
      asrType: form.asrType || 'OFFSET_AFTER_ADHAN',
      asrOffsetMinutes: Number(form.asrOffsetMinutes ?? 15),
      asrFixedTime: form.asrType === 'FIXED_TIME' && form.asrFixedTime ? `${form.asrFixedTime.slice(0, 5)}:00` : null,

      maghribAdhanTime: form.maghribAdhanMode === 'CUSTOM' && form.maghribAdhanTime ? `${form.maghribAdhanTime.slice(0, 5)}:00` : null,
      maghribType: form.maghribType || 'OFFSET_AFTER_ADHAN',
      maghribOffsetMinutes: Number(form.maghribOffsetMinutes ?? 0),
      maghribFixedTime: form.maghribType === 'FIXED_TIME' && form.maghribFixedTime ? `${form.maghribFixedTime.slice(0, 5)}:00` : null,

      ishaAdhanTime: form.ishaAdhanMode === 'CUSTOM' && form.ishaAdhanTime ? `${form.ishaAdhanTime.slice(0, 5)}:00` : null,
      ishaType: form.ishaType || 'OFFSET_AFTER_ADHAN',
      ishaOffsetMinutes: Number(form.ishaOffsetMinutes ?? 15),
      ishaFixedTime: form.ishaType === 'FIXED_TIME' && form.ishaFixedTime ? `${form.ishaFixedTime.slice(0, 5)}:00` : null,

      jummah1Time: form.jummah1Time ? `${form.jummah1Time.slice(0, 5)}:00` : '13:15:00',
      jummah2Time: form.jummah2Time && form.jummah2Time.trim() !== '' ? `${form.jummah2Time.slice(0, 5)}:00` : null,
      jummahKhutbahLanguage: form.jummahKhutbahLanguage || 'Arabic',
    };

    try {
      await mosqueService.updateMosqueIqamahSchedule(mosqueId, payload);
      setSuccessMsg('Prayer timings and Iqamah schedule successfully updated!');
      onSaved?.(payload);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update prayer times');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-500">
        <RefreshCw className="animate-spin text-primary-500" size={28} />
        <span className="text-sm font-medium">Loading mosque prayer settings...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
            <Clock size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
              Edit Prayer &amp; Iqamah Times
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Configure Adhan &amp; congregation timings for <strong className="text-gray-800 dark:text-gray-200">{mosqueName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
            <span>{saving ? 'Saving...' : 'Save All Times'}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              title="Close modal"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle size={16} className="shrink-0 text-green-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 5 Daily Prayers Configuration */}
      <div className="space-y-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Daily Prayers – Adhan &amp; Congregation Timings
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Configure astronomical vs custom Adhan times, and offset vs fixed Iqamah timings.
          </p>
        </div>

        <div className="space-y-3">
          {PRAYERS.map(({ key, label, defaultAdhan, defaultFixed }) => {
            const adhanModeField = `${key}AdhanMode`;
            const adhanTimeField = `${key}AdhanTime`;
            const typeField = `${key}Type`;
            const offsetField = `${key}OffsetMinutes`;
            const fixedField = `${key}FixedTime`;

            const isCustomAdhan = form[adhanModeField] === 'CUSTOM';
            const isOffset = form[typeField] !== 'FIXED_TIME';

            return (
              <div
                key={key}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-2xs space-y-3"
              >
                {/* Header with Prayer Name */}
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-500 shrink-0" />
                    <h5 className="font-bold text-sm text-gray-900 dark:text-white capitalize">{label}</h5>
                  </div>
                  <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                    Timetable Configuration
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* Row 1: Adhan (Start Time) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                    <div className="w-40 shrink-0">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        Adhan (Start Time)
                      </span>
                    </div>

                    <div className="w-56 shrink-0">
                      <div className="inline-flex w-full rounded-lg bg-gray-200/80 dark:bg-gray-800 p-0.5 text-xs">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, [adhanModeField]: 'AUTO', [adhanTimeField]: '' })}
                          className={`flex-1 py-1.5 text-center rounded-md font-bold transition-all cursor-pointer ${
                            !isCustomAdhan
                              ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-300 shadow-xs'
                              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                          }`}
                        >
                          Auto (Calculated)
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, [adhanModeField]: 'CUSTOM', [adhanTimeField]: form[adhanTimeField] || defaultAdhan })}
                          className={`flex-1 py-1.5 text-center rounded-md font-bold transition-all cursor-pointer ${
                            isCustomAdhan
                              ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-300 shadow-xs'
                              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                          }`}
                        >
                          Custom Time
                        </button>
                      </div>
                    </div>

                    <div className="w-56 shrink-0 flex items-center justify-start sm:justify-end">
                      {!isCustomAdhan ? (
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200/60 dark:bg-gray-800/80 px-3 py-1.5 rounded-lg font-medium">
                          Astronomical (Aladhan)
                        </span>
                      ) : (
                        <input
                          type="time"
                          required={isCustomAdhan}
                          value={form[adhanTimeField] || ''}
                          onChange={(e) => setForm({ ...form, [adhanTimeField]: e.target.value })}
                          className="w-36 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                      )}
                    </div>
                  </div>

                  {/* Row 2: Iqamah (Congregation Time) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                    <div className="w-40 shrink-0">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        Iqamah (Congregation)
                      </span>
                    </div>

                    <div className="w-56 shrink-0">
                      <div className="inline-flex w-full rounded-lg bg-gray-200/80 dark:bg-gray-800 p-0.5 text-xs">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, [typeField]: 'OFFSET_AFTER_ADHAN' })}
                          className={`flex-1 py-1.5 text-center rounded-md font-bold transition-all cursor-pointer ${
                            isOffset
                              ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-300 shadow-xs'
                              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                          }`}
                        >
                          Offset (+mins)
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, [typeField]: 'FIXED_TIME', [fixedField]: form[fixedField] || defaultFixed })}
                          className={`flex-1 py-1.5 text-center rounded-md font-bold transition-all cursor-pointer ${
                            !isOffset
                              ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-300 shadow-xs'
                              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                          }`}
                        >
                          Fixed Time
                        </button>
                      </div>
                    </div>

                    <div className="w-56 shrink-0 flex items-center justify-start sm:justify-end">
                      {isOffset ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="60"
                            value={form[offsetField]}
                            onChange={(e) => setForm({ ...form, [offsetField]: e.target.value })}
                            className="w-16 px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-center"
                          />
                          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                            {Number(form[offsetField]) === 0 ? 'Immediately' : 'mins after Adhan'}
                          </span>
                        </div>
                      ) : (
                        <input
                          type="time"
                          required={!isOffset}
                          value={form[fixedField] || ''}
                          onChange={(e) => setForm({ ...form, [fixedField]: e.target.value })}
                          className="w-36 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Friday Jumu'ah Section */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Friday Jumu&apos;ah Schedule
        </h4>

        <div className="p-4 bg-primary-50/40 dark:bg-primary-950/20 rounded-2xl border border-primary-100 dark:border-primary-900/50 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                1st Jumu&apos;ah Batch
              </label>
              <input
                type="time"
                required
                value={form.jummah1Time}
                onChange={(e) => setForm({ ...form, jummah1Time: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                2nd Jumu&apos;ah Batch (Optional)
              </label>
              <input
                type="time"
                value={form.jummah2Time}
                onChange={(e) => setForm({ ...form, jummah2Time: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Khutbah Language
              </label>
              <select
                value={form.jummahKhutbahLanguage || 'Arabic'}
                onChange={(e) => setForm({ ...form, jummahKhutbahLanguage: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value="Arabic">Arabic (العربية)</option>
                <option value="Arabic & English">Arabic &amp; English</option>
                <option value="English">English</option>
                <option value="Urdu">Urdu</option>
                <option value="Turkish">Turkish</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
          <span>{saving ? 'Saving...' : 'Save All Prayer Times'}</span>
        </button>
      </div>
    </form>
  );
}