import { useState } from 'react';
import { Clock, Check, Calendar, Settings } from 'lucide-react';
import { formatPrayerTime, getCurrentPrayer } from '../../utils/helpers';
import AnnualPrayerModal from './AnnualPrayerModal';

export default function PrayerTable({
  prayerData = {},
  prayerTimes = {},
  mosque = {},
  canEdit = false,
  onEditPrayerTimes,
}) {
  const [showAnnualModal, setShowAnnualModal] = useState(false);

  // If structured backend prayerData is passed - filter out non-fard Sunrise
  const timings = (prayerData.timings || []).filter(
    (t) => t.prayerName?.toUpperCase() !== 'SUNRISE'
  );
  const hijriDate = prayerData.hijriDate;
  const jummahSchedule = prayerData.jummahSchedule;
  const nextPrayer = prayerData.nextPrayer;
  const timeRemainingFormatted = prayerData.timeRemainingFormatted;

  // If simple dictionary is passed - 5 daily congregational prayers
  const fallbackPrayers = [
    { name: 'Fajr', adhan: prayerTimes.Fajr || prayerTimes.fajr, iqamah: prayerTimes.fajrIqamah },
    { name: 'Dhuhr', adhan: prayerTimes.Dhuhr || prayerTimes.dhuhr, iqamah: prayerTimes.dhuhrIqamah },
    { name: 'Asr', adhan: prayerTimes.Asr || prayerTimes.asr, iqamah: prayerTimes.asrIqamah },
    { name: 'Maghrib', adhan: prayerTimes.Maghrib || prayerTimes.maghrib, iqamah: prayerTimes.Maghrib || prayerTimes.maghrib || prayerTimes.maghribIqamah },
    { name: 'Isha', adhan: prayerTimes.Isha || prayerTimes.isha, iqamah: prayerTimes.ishaIqamah },
  ].filter((p) => p.adhan);

  const hasTimings = timings.length > 0;
  const currentPrayer = getCurrentPrayer(prayerTimes);

  const cleanNextPrayer = nextPrayer ? nextPrayer.replace(/\s*\(Tomorrow\)/i, '') : '';
  const cleanTimeRemaining =
    timeRemainingFormatted && timeRemainingFormatted.toLowerCase() !== 'tomorrow'
      ? timeRemainingFormatted
      : 'tomorrow';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      {/* Table Header */}
      <div className="p-4 sm:px-5 sm:py-4 bg-primary-600 text-white flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0 shadow-inner">
            <Clock size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base leading-snug">Daily Prayer &amp; Iqamah Times</h3>
            {hijriDate && (
              <p className="text-xs text-primary-100 font-medium truncate">{hijriDate}</p>
            )}
          </div>
        </div>
        {cleanNextPrayer && (
          <div className="shrink-0 flex items-center">
            <span className="text-xs font-semibold px-3 py-1 bg-white/20 backdrop-blur-md rounded-full shadow-sm whitespace-nowrap">
              Next: <span className="font-bold uppercase">{cleanNextPrayer}</span>{' '}
              <span className="font-normal text-primary-100">{cleanTimeRemaining}</span>
            </span>
          </div>
        )}
      </div>

      {/* Prayers List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        <div className="grid grid-cols-12 px-5 py-2.5 bg-gray-50 dark:bg-gray-900/40 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <span className="col-span-5">Prayer</span>
          <span className="col-span-4 text-center">Adhan (Start)</span>
          <span className="col-span-3 text-right">Iqamah</span>
        </div>

        {hasTimings ? (
          timings.map((t) => {
            const isNext = t.next;
            return (
              <div
                key={t.prayerName}
                className={`grid grid-cols-12 items-center px-5 py-3 transition-colors ${
                  isNext
                    ? 'bg-primary-50/80 dark:bg-primary-950/40 font-semibold'
                    : 'hover:bg-gray-50/50 dark:hover:bg-gray-700/30'
                }`}
              >
                <div className="col-span-5 flex items-center gap-2">
                  {isNext ? (
                    <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-transparent" />
                  )}
                  <span className={`text-sm capitalize ${isNext ? 'text-primary-700 dark:text-primary-300 font-bold' : 'text-gray-900 dark:text-white'}`}>
                    {t.prayerName.toLowerCase()}
                  </span>
                </div>

                <div className="col-span-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.adhanTime ? formatPrayerTime(t.adhanTime) : '—'}
                </div>

                <div className="col-span-3 text-right text-sm font-bold text-primary-600 dark:text-primary-400">
                  {t.iqamahTime
                    ? formatPrayerTime(t.iqamahTime)
                    : t.prayerName?.toUpperCase() === 'SUNRISE'
                    ? '—'
                    : (t.adhanTime ? formatPrayerTime(t.adhanTime) : 'At Adhan')}
                </div>
              </div>
            );
          })
        ) : fallbackPrayers.length > 0 ? (
          fallbackPrayers.map((p) => {
            const isCurrent = currentPrayer === p.name;
            return (
              <div
                key={p.name}
                className={`grid grid-cols-12 items-center px-5 py-3 transition-colors ${
                  isCurrent ? 'bg-primary-50 dark:bg-primary-950/40' : ''
                }`}
              >
                <div className="col-span-5 flex items-center gap-2">
                  {isCurrent && <Check size={14} className="text-primary-500" />}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {p.name}
                  </span>
                </div>
                <div className="col-span-4 text-center text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {formatPrayerTime(p.adhan)}
                </div>
                <div className="col-span-3 text-right text-sm font-bold text-primary-600 dark:text-primary-400">
                  {p.name === 'Maghrib' ? formatPrayerTime(p.adhan) : p.iqamah ? formatPrayerTime(p.iqamah) : 'At Adhan'}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center text-gray-400 text-sm">
            Prayer schedules will be published shortly.
          </div>
        )}
      </div>

      {/* Friday Jumu'ah Box */}
      {jummahSchedule && (
        <div className="p-4 bg-primary-50/50 dark:bg-primary-950/30 border-t border-primary-100 dark:border-primary-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary-900 dark:text-primary-200 uppercase tracking-wider">
              Friday Jumu&apos;ah:
            </span>
            <span className="font-semibold text-primary-700 dark:text-primary-300">
              1st Batch: {formatPrayerTime(jummahSchedule.firstJummahTime || '13:15')}
            </span>
            {jummahSchedule.secondJummahTime &&
              jummahSchedule.secondJummahTime !== 'null' &&
              jummahSchedule.secondJummahTime !== '--:--' &&
              String(jummahSchedule.secondJummahTime).trim() !== '' && (
              <span className="text-gray-600 dark:text-gray-400">
                • 2nd Batch: {formatPrayerTime(jummahSchedule.secondJummahTime)}
              </span>
            )}
          </div>
          <span className="text-gray-600 dark:text-gray-300 font-medium">
            Khutbah: {jummahSchedule.khutbahLanguage || 'Arabic'}
          </span>
        </div>
      )}

      {/* Full Year Timetable Action & Admin Edit Times */}
      <div className="p-3 bg-gray-50/80 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700/60 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setShowAnnualModal(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors py-2 px-4 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/50 cursor-pointer"
        >
          <Calendar size={14} />
          <span>Full Year Prayer Schedule</span>
        </button>

        {canEdit && (
          <button
            type="button"
            onClick={onEditPrayerTimes}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors py-2 px-4 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/50 cursor-pointer"
          >
            <Settings size={14} />
            <span>Edit Prayer Times (Admin)</span>
          </button>
        )}
      </div>

      {showAnnualModal && (
        <AnnualPrayerModal
          mosque={mosque}
          prayerData={prayerData}
          prayerTimes={prayerTimes}
          onClose={() => setShowAnnualModal(false)}
        />
      )}
    </div>
  );
}
