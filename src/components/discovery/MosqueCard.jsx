import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Star, Clock, Heart, ShieldCheck } from 'lucide-react';
import { formatPrayerTime, getCurrentPrayer, formatDistance, calculateDistance, getPlaceholderImage } from '../../utils/helpers';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocationContext } from '../../context/LocationContext';

export default function MosqueCard({ mosque, onFavorite, isFavorited = false }) {
  const [imgError, setImgError] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPrayer = getCurrentPrayer(mosque.prayerTimes);
  const { currentLocation } = useLocationContext() || {};

  let distanceKm = mosque.distanceKm ?? mosque.distance;
  if (distanceKm == null && currentLocation?.lat && currentLocation?.lng && (mosque.latitude || mosque.lat) && (mosque.longitude || mosque.lng)) {
    const mLat = mosque.latitude || mosque.lat;
    const mLng = mosque.longitude || mosque.lng;
    if (mLat !== 0 && mLng !== 0) {
      distanceKm = calculateDistance(currentLocation.lat, currentLocation.lng, mLat, mLng);
    }
  }

  const displayImage = imgError
    ? getPlaceholderImage(400, 300, mosque.name)
    : (mosque.coverImageUrl || mosque.images?.[0] || getPlaceholderImage(400, 300, mosque.name));

  const rawFacilities = mosque.facilities?.length
    ? mosque.facilities
    : (mosque.facilityCodes || []);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login', {
        state: {
          from: location.pathname + location.search,
          message: 'Please sign in or register to save mosques to your favorites.',
        },
      });
      return;
    }

    onFavorite?.(mosque.id || mosque.slug);
  };

  return (
    <Link
      to={`/mosques/${mosque.id || mosque.slug}`}
      className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-300 flex flex-col h-full"
    >
      {/* 1. Image Container (Fixed Height) */}
      <div className="relative h-48 sm:h-52 overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
        <img
          src={displayImage}
          alt={mosque.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgError(true)}
          loading="lazy"
        />

        {/* Gradient overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 pointer-events-none" />

        {/* Distance badge */}
        {distanceKm != null && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
            <MapPin size={12} className="text-primary-300" />
            {formatDistance(distanceKm)}
          </div>
        )}

        {/* Verified badge */}
        {mosque.verified && (
          <div className="absolute bottom-3 left-3 bg-primary-600/90 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <ShieldCheck size={12} />
            <span>Verified</span>
          </div>
        )}

        {/* Favorite button with login requirement */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 active:scale-90 cursor-pointer ${
            isFavorited
              ? 'bg-primary-500 text-white shadow-md'
              : 'bg-black/40 text-white hover:bg-primary-500 hover:text-white'
          }`}
          title={user ? (isFavorited ? 'Remove from favorites' : 'Add to favorites') : 'Sign in to favorite'}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={16} className={isFavorited ? 'fill-current text-white' : ''} />
        </button>
      </div>

      {/* 2. Content Body (Uniformly Pinned Alignment) */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        {/* Upper Info: Title, Address, Rating with strict heights */}
        <div>
          {/* Title: exactly 1 line with ellipsis (height 28px) */}
          <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate h-7 flex items-center">
            {mosque.name}
          </h3>

          {/* Address: exactly 1 line with truncate (height 20px) */}
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1 h-5 overflow-hidden">
            <MapPin size={13} className="shrink-0 text-gray-400" />
            <span className="truncate">
              {mosque.address ? `${mosque.address}, ${mosque.city}` : mosque.city || 'Address not available'}
            </span>
          </p>

          {/* Rating: exactly 1 line (height 20px) */}
          <div className="flex items-center gap-2 mt-2 h-5">
            {mosque.rating != null && mosque.rating > 0 ? (
              <>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {Number(mosque.rating).toFixed(1)}
                  </span>
                </div>
                {mosque.reviewCount > 0 && (
                  <span className="text-xs text-gray-400">
                    ({mosque.reviewCount} {mosque.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Star size={13} className="text-gray-300 dark:text-gray-600" />
                <span>No ratings yet</span>
              </span>
            )}
          </div>
        </div>

        {/* Lower Info: Pinned to Bottom, perfectly uniform across every card */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex flex-col gap-2.5">
          {/* Prayer Timing Box (Fixed Height 40px) */}
          <div className="h-10 flex items-center justify-between px-3 py-2 bg-primary-50 dark:bg-primary-950/40 rounded-xl text-xs font-medium text-primary-700 dark:text-primary-300 shrink-0">
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-primary-600 dark:text-primary-400" />
              <span>{currentPrayer ? `${currentPrayer} Prayer` : 'Daily Prayer'}</span>
            </span>
            <span className="font-bold">
              {currentPrayer && mosque.prayerTimes?.[currentPrayer]
                ? formatPrayerTime(mosque.prayerTimes[currentPrayer])
                : (mosque.prayerTimes?.Dhuhr ? formatPrayerTime(mosque.prayerTimes.Dhuhr) : '4:00 PM')}
            </span>
          </div>

          {/* Facility Badges (Fixed Single-Row Height 28px) */}
          <div className="h-7 flex items-center gap-1.5 overflow-hidden">
            {rawFacilities.slice(0, 3).map((facility) => {
              if (!facility) return null;
              const raw = typeof facility === 'string'
                ? facility
                : facility.name || facility.facilityName || facility.code || '';
              const label = String(raw).replace(/_/g, ' ').toLowerCase();
              if (!label) return null;

              return (
                <span
                  key={typeof facility === 'string' ? facility : facility.id || facility.code || label}
                  className="text-[11px] font-medium bg-gray-100 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md capitalize shrink-0 whitespace-nowrap"
                >
                  {label}
                </span>
              );
            })}
            {rawFacilities.length > 3 && (
              <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-1.5 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                +{rawFacilities.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
