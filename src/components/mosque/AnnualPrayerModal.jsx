import { useState, useMemo, useEffect } from 'react';
import { X, Calendar, Printer, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { formatPrayerTime } from '../../utils/helpers';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getDaysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.toString().trim().split(':');
  if (parts.length < 2) return null;
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function minutesToTimeString(totalMinutes) {
  let mins = Math.round(totalMinutes);
  if (mins < 0) mins += 1440;
  mins = mins % 1440;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default function AnnualPrayerModal({ mosque = {}, prayerData = {}, prayerTimes = {}, onClose }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const todayDate = new Date().getDate();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = origOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Derive baseline prayer minutes
  const baseline = useMemo(() => {
    const timings = prayerData.timings || [];
    const getAdhan = (name) => {
      const match = timings.find((t) => t.prayerName?.toUpperCase() === name.toUpperCase());
      if (match?.adhanTime) return match.adhanTime;
      return prayerTimes[name] || prayerTimes[name.toLowerCase()] || null;
    };
    const getIqamah = (name) => {
      const match = timings.find((t) => t.prayerName?.toUpperCase() === name.toUpperCase());
      if (match?.iqamahTime) return match.iqamahTime;
      return prayerTimes[`${name.toLowerCase()}Iqamah`] || null;
    };

    return {
      fajrAdhan: parseTimeToMinutes(getAdhan('Fajr')) ?? 315, // 05:15
      fajrIqamah: parseTimeToMinutes(getIqamah('Fajr')) ?? 335, // 05:35
      dhuhrAdhan: parseTimeToMinutes(getAdhan('Dhuhr')) ?? 755, // 12:35
      dhuhrIqamah: parseTimeToMinutes(getIqamah('Dhuhr')) ?? 810, // 13:30
      asrAdhan: parseTimeToMinutes(getAdhan('Asr')) ?? 970, // 16:10
      asrIqamah: parseTimeToMinutes(getIqamah('Asr')) ?? 985, // 16:25
      maghribAdhan: parseTimeToMinutes(getAdhan('Maghrib')) ?? 1125, // 18:45
      maghribIqamah: parseTimeToMinutes(getAdhan('Maghrib')) ?? 1125, // Immediately after Adhan
      ishaAdhan: parseTimeToMinutes(getAdhan('Isha')) ?? 1205, // 20:05
      ishaIqamah: parseTimeToMinutes(getIqamah('Isha')) ?? 1220, // 20:20
    };
  }, [prayerData, prayerTimes]);

  // Generate monthly timetable
  const monthSchedule = useMemo(() => {
    const daysCount = getDaysInMonth(currentYear, selectedMonth);
    const days = [];

    // Current day of year for seasonal adjustment
    const startOfYear = new Date(currentYear, 0, 1);

    for (let day = 1; day <= daysCount; day++) {
      const dateObj = new Date(currentYear, selectedMonth, day);
      const dayOfYear = Math.floor((dateObj - startOfYear) / (1000 * 60 * 60 * 24));
      
      // Seasonal minute shift based on solar declination throughout the year
      // Max delta around solstice (+/- 30 mins for solar angle variation)
      const seasonalShift = Math.sin(((dayOfYear - 80) * 2 * Math.PI) / 365) * 28;

      const fajrAdhan = baseline.fajrAdhan - seasonalShift * 0.7;
      const fajrIqamah = baseline.fajrIqamah - seasonalShift * 0.7;

      const dhuhrAdhan = baseline.dhuhrAdhan;
      const dhuhrIqamah = baseline.dhuhrIqamah;

      const asrAdhan = baseline.asrAdhan + seasonalShift * 0.3;
      const asrIqamah = baseline.asrIqamah + seasonalShift * 0.3;

      const maghribAdhan = baseline.maghribAdhan + seasonalShift * 0.8;
      const maghribIqamah = baseline.maghribIqamah + seasonalShift * 0.8;

      const ishaAdhan = baseline.ishaAdhan + seasonalShift * 0.6;
      const ishaIqamah = baseline.ishaIqamah + seasonalShift * 0.6;

      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const isToday = selectedMonth === currentMonth && day === todayDate;

      days.push({
        day,
        dayName,
        isFriday: dayName === 'Fri',
        isToday,
        fajr: { adhan: minutesToTimeString(fajrAdhan), iqamah: minutesToTimeString(fajrIqamah) },
        dhuhr: { adhan: minutesToTimeString(dhuhrAdhan), iqamah: minutesToTimeString(dhuhrIqamah) },
        asr: { adhan: minutesToTimeString(asrAdhan), iqamah: minutesToTimeString(asrIqamah) },
        maghrib: { adhan: minutesToTimeString(maghribAdhan), iqamah: minutesToTimeString(maghribIqamah) },
        isha: { adhan: minutesToTimeString(ishaAdhan), iqamah: minutesToTimeString(ishaIqamah) },
      });
    }

    return days;
  }, [currentYear, selectedMonth, currentMonth, todayDate, baseline]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Day', 'Weekday', 'Fajr Adhan', 'Fajr Iqamah', 'Dhuhr Adhan', 'Dhuhr Iqamah', 'Asr Adhan', 'Asr Iqamah', 'Maghrib Adhan', 'Maghrib Iqamah', 'Isha Adhan', 'Isha Iqamah'];
    const rows = monthSchedule.map((d) => [
      d.day,
      d.dayName,
      formatPrayerTime(d.fajr.adhan),
      formatPrayerTime(d.fajr.iqamah),
      formatPrayerTime(d.dhuhr.adhan),
      formatPrayerTime(d.dhuhr.iqamah),
      formatPrayerTime(d.asr.adhan),
      formatPrayerTime(d.asr.iqamah),
      formatPrayerTime(d.maghrib.adhan),
      formatPrayerTime(d.maghrib.iqamah),
      formatPrayerTime(d.isha.adhan),
      formatPrayerTime(d.isha.iqamah),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${(mosque.name || 'Mosque').replace(/\s+/g, '_')}_Prayer_Schedule_${MONTHS[selectedMonth]}_${currentYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="annual-prayer-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-primary-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Calendar size={22} className="text-white" />
            </div>
            <div>
              <h2 id="annual-prayer-title" className="text-lg font-bold">
                Annual Prayer Timetable · {currentYear}
              </h2>
              <p className="text-xs text-primary-100 font-medium">
                {mosque.name || 'OpenMosque Partner Masjid'} {mosque.city ? `(${mosque.city})` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              aria-label="Print timetable"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <Printer size={14} />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              aria-label="Export timetable CSV"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <Download size={14} />
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Month Selector Pills */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 overflow-x-auto flex items-center gap-1.5 scrollbar-thin shrink-0">
          {MONTHS.map((m, idx) => {
            const isSelected = idx === selectedMonth;
            const isCurrent = idx === currentMonth;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMonth(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary-500 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 hover:bg-primary-100'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                {m.slice(0, 3)}
              </button>
            );
          })}
        </div>

        {/* Subheader: Selected Month and Notice */}
        <div className="px-6 py-2.5 bg-primary-50/40 dark:bg-primary-950/20 border-b border-primary-100/50 dark:border-primary-900/40 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-primary-900 dark:text-primary-100 text-sm">
              {MONTHS[selectedMonth]} {currentYear}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              ({monthSchedule.length} days)
            </span>
          </div>
          <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">
            All times displayed in local mosque timezone · Adhan / Iqamah
          </span>
        </div>

        {/* Timetable Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto overflow-x-auto px-4 sm:px-6 pb-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-20">
              <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold uppercase tracking-wider">
                <th className="py-3 px-3 rounded-l-xl bg-gray-100 dark:bg-gray-900 sticky top-0 shadow-sm">Date</th>
                <th className="py-3 px-3 text-center bg-gray-100 dark:bg-gray-900 sticky top-0 shadow-sm">Fajr</th>
                <th className="py-3 px-3 text-center bg-gray-100 dark:bg-gray-900 sticky top-0 shadow-sm">Dhuhr</th>
                <th className="py-3 px-3 text-center bg-gray-100 dark:bg-gray-900 sticky top-0 shadow-sm">Asr</th>
                <th className="py-3 px-3 text-center bg-gray-100 dark:bg-gray-900 sticky top-0 shadow-sm">Maghrib</th>
                <th className="py-3 px-3 text-center rounded-r-xl bg-gray-100 dark:bg-gray-900 sticky top-0 shadow-sm">Isha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {monthSchedule.map((d) => {
                return (
                  <tr
                    key={d.day}
                    className={`transition-colors ${
                      d.isToday
                        ? 'bg-primary-50/80 dark:bg-primary-950/40 font-bold'
                        : d.isFriday
                        ? 'bg-amber-50/30 dark:bg-amber-950/10'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/20'
                    }`}
                  >
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 text-right font-bold ${d.isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-gray-100'}`}>
                          {d.day}
                        </span>
                        <span className={`text-[11px] uppercase font-semibold px-1.5 py-0.5 rounded ${d.isFriday ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200' : 'text-gray-400'}`}>
                          {d.dayName}
                        </span>
                        {d.isToday && (
                          <span className="text-[10px] font-black uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/40 px-1.5 py-0.5 rounded">
                            Today
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Fajr */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="text-gray-900 dark:text-gray-100">{formatPrayerTime(d.fajr.adhan)}</div>
                      <div className="text-[10px] font-bold text-primary-600 dark:text-primary-400">{formatPrayerTime(d.fajr.iqamah)}</div>
                    </td>

                    {/* Dhuhr */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="text-gray-900 dark:text-gray-100">{formatPrayerTime(d.dhuhr.adhan)}</div>
                      <div className="text-[10px] font-bold text-primary-600 dark:text-primary-400">{formatPrayerTime(d.dhuhr.iqamah)}</div>
                    </td>

                    {/* Asr */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="text-gray-900 dark:text-gray-100">{formatPrayerTime(d.asr.adhan)}</div>
                      <div className="text-[10px] font-bold text-primary-600 dark:text-primary-400">{formatPrayerTime(d.asr.iqamah)}</div>
                    </td>

                    {/* Maghrib */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="text-gray-900 dark:text-gray-100">{formatPrayerTime(d.maghrib.adhan)}</div>
                      <div className="text-[10px] font-bold text-primary-600 dark:text-primary-400">{formatPrayerTime(d.maghrib.iqamah)}</div>
                    </td>

                    {/* Isha */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="text-gray-900 dark:text-gray-100">{formatPrayerTime(d.isha.adhan)}</div>
                      <div className="text-[10px] font-bold text-primary-600 dark:text-primary-400">{formatPrayerTime(d.isha.iqamah)}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-500" />
              <span>Top: Adhan Time</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-700 dark:bg-primary-400" />
              <span className="font-bold text-primary-600 dark:text-primary-400">Green: Iqamah</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
