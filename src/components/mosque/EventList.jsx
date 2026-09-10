import { Calendar, Clock, MapPin, Radio, User, ExternalLink, Sparkles, BookOpen, Plus, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

function EventCard({ event, canManage, onDelete }) {
  const isLive = event.isLive || (event.streamUrl && new Date(event.startDateTime) <= new Date() && new Date() <= new Date(event.endDateTime));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between relative group">
      {canManage && onDelete && (
        <button
          type="button"
          onClick={() => onDelete(event.id)}
          title="Delete Event"
          className="absolute top-2.5 right-2.5 z-10 p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-600 rounded-lg shadow-sm border border-rose-200 dark:border-rose-800 cursor-pointer opacity-90 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={14} />
        </button>
      )}

      {event.bannerImageUrl && (
        <div className="h-36 w-full overflow-hidden bg-gray-100 dark:bg-gray-900 relative">
          <img
            src={event.bannerImageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {event.eventType && (
            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[11px] font-bold bg-black/60 backdrop-blur-sm text-white uppercase tracking-wider">
              {event.eventType.replace(/_/g, ' ')}
            </span>
          )}
        </div>
      )}

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {isLive && (
            <div className="flex items-center gap-1.5 text-rose-600 text-xs font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <Radio size={12} />
              BROADCASTING LIVE
            </div>
          )}

          <h4 className="font-semibold text-gray-900 dark:text-white text-base leading-snug">{event.title}</h4>

          {event.speakerName && (
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <User size={12} /> {event.speakerName}
            </p>
          )}

          {event.description && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 space-y-1.5">
          {event.startDateTime && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Calendar size={12} className="text-emerald-500 shrink-0" />
              <span>{formatDate(event.startDateTime)}</span>
              {event.endDateTime && (
                <span className="text-gray-400">· {new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              )}
            </div>
          )}

          {event.locationDetails && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <MapPin size={12} className="text-sky-500 shrink-0" />
              <span className="truncate">{event.locationDetails}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            {event.registrationUrl ? (
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                Register Online <ExternalLink size={11} />
              </a>
            ) : <span />}

            {event.streamUrl && (
              <a
                href={event.streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
              >
                <Radio size={12} /> Watch Stream
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KhutbahCard({ khutbah, canManage, onDelete }) {
  return (
    <div className="bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 p-4 relative group">
      {canManage && onDelete && (
        <button
          type="button"
          onClick={() => onDelete(khutbah.id)}
          title="Delete Khutbah"
          className="absolute top-3 right-3 p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-600 rounded-lg shadow-sm border border-rose-200 dark:border-rose-800 cursor-pointer opacity-90 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={13} />
        </button>
      )}

      <div className="flex items-center justify-between gap-2 mb-2 pr-8">
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
          Friday Jumu'ah · Batch #{khutbah.batchNumber || 1}
        </span>
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <Clock size={12} /> {khutbah.khutbahTime ? khutbah.khutbahTime.substring(0, 5) : '13:15'}
        </span>
      </div>

      <h5 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base leading-snug">
        {khutbah.topic || 'Friday Sermon'}
      </h5>

      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mt-1 flex items-center gap-1">
        <User size={12} /> Khatib: {khutbah.khatibName || 'Imam'}
      </p>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-emerald-100 dark:border-emerald-900/40">
        <span>Language: <strong>{khutbah.language || 'English'}</strong></span>
        {khutbah.streamUrl && (
          <a
            href={khutbah.streamUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1"
          >
            <Radio size={12} /> Live Broadcast
          </a>
        )}
      </div>
    </div>
  );
}

export default function EventList({
  events = [],
  khutbahs = [],
  canManage = false,
  onAddKhutbah,
  onAddEvent,
  onDeleteKhutbah,
  onDeleteEvent,
}) {
  const hasEvents = events && events.length > 0;
  const hasKhutbahs = khutbahs && khutbahs.length > 0;

  return (
    <div className="space-y-6">
      {/* Management Action Bar for Mosque Admins */}
      {canManage && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40">
          <div>
            <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Mosque Management Controls
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Schedule upcoming sermons and community gatherings
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onAddKhutbah && (
              <button
                type="button"
                onClick={onAddKhutbah}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
              >
                <Plus size={14} />
                <span>Schedule Khutbah</span>
              </button>
            )}
            {onAddEvent && (
              <button
                type="button"
                onClick={onAddEvent}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Program</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasEvents && !hasKhutbahs && (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
          <Calendar size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No scheduled events or khutbahs right now.</p>
          <p className="text-xs text-gray-400 mt-1">Check back soon for upcoming lectures, workshops, and Friday updates.</p>
        </div>
      )}

      {/* Friday Jumu'ah Schedules */}
      {hasKhutbahs && (
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-600" />
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                Upcoming Friday Jumu'ah Sermons ({khutbahs.length})
              </h4>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {khutbahs.map((khutbah) => (
              <KhutbahCard
                key={khutbah.id || khutbah.topic}
                khutbah={khutbah}
                canManage={canManage}
                onDelete={onDeleteKhutbah}
              />
            ))}
          </div>
        </div>
      )}

      {/* Mosque Events */}
      {hasEvents && (
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-emerald-600" />
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                Community Programs &amp; Lectures ({events.length})
              </h4>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                canManage={canManage}
                onDelete={onDeleteEvent}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
