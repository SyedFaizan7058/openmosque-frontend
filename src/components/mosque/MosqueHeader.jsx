import { MapPin, Star, Heart, Share2, ExternalLink, Clock, Radio } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { timeAgo } from '../../utils/helpers';
import { useState } from 'react';

export default function MosqueHeader({ mosque, onFavorite, isFavorited = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [shareTooltip, setShareTooltip] = useState(false);

  const handleFavoriteClick = () => {
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

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: mosque.name, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setShareTooltip(true);
      setTimeout(() => setShareTooltip(false), 2000);
    }
  };

  const getGoogleMapsUrl = () => {
    const lat = parseFloat(mosque.latitude ?? mosque.lat);
    const lng = parseFloat(mosque.longitude ?? mosque.lng);
    const hasValidCoords =
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat !== 0 &&
      lng !== 0 &&
      !(Math.abs(lat - 51.5074) < 0.001 && Math.abs(lng - (-0.1278)) < 0.001);

    if (hasValidCoords) {
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }

    const queryParts = [mosque.name, mosque.address, mosque.city, mosque.state, mosque.country].filter(Boolean);
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(queryParts.join(', '))}`;
  };

  const mapsUrl = getGoogleMapsUrl();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {mosque.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-2.5">
              {mosque.rating != null && mosque.rating > 0 ? (
                <div className="flex items-center gap-1.5">
                  <Star size={16} className="text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {Number(mosque.rating).toFixed(1)}
                  </span>
                  {mosque.reviewCount > 0 && (
                    <span className="text-xs text-gray-400">
                      ({mosque.reviewCount} {mosque.reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Star size={14} className="text-gray-300 dark:text-gray-600" />
                  <span>No ratings yet</span>
                </div>
              )}

              {mosque.address && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  <MapPin size={14} className="text-primary-500 shrink-0" />
                  <span>{[mosque.address, mosque.city, mosque.country].filter(Boolean).join(', ')}</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>

            {mosque.liveStreamUrl && (
              <a
                href={mosque.liveStreamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold rounded-full border border-red-200 dark:border-red-900/50 hover:bg-red-100 transition-colors"
              >
                <Radio size={13} className="animate-pulse" />
                <span>Live Broadcast Available</span>
              </a>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              id="favorite-btn"
              onClick={handleFavoriteClick}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                isFavorited
                  ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-primary-500/25'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
              }`}
            >
              <Heart size={15} className={isFavorited ? 'fill-current text-white' : 'text-primary-600 dark:text-primary-400'} />
              <span>{isFavorited ? 'Saved to Favorites' : 'Favorite'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="relative flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Share2 size={15} />
              <span>Share</span>
              {shareTooltip && (
                <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap">
                  Link Copied!
                </span>
              )}
            </button>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-primary-500/20 cursor-pointer"
            >
              <MapPin size={15} />
              <span>Directions</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
