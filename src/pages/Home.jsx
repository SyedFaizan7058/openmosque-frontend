import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Plus, ArrowRight, Clock, Star, TrendingUp, Megaphone, ShieldCheck, Sparkles, Compass } from 'lucide-react';
import SearchBar from '../components/common/SearchBar';
import MosqueCard from '../components/discovery/MosqueCard';
import { useGeolocation } from '../hooks';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import mosqueService from '../services/mosqueService';

export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { location, requestLocation } = useGeolocation();
  const { currentLocation, openLocationModal } = useLocationContext();

  const [popularMosques, setPopularMosques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (user) {
      mosqueService.getFavorites()
        .then((favs) => setFavorites((favs || []).map((f) => f.mosqueId || f.id)))
        .catch(() => setFavorites([]));
    } else {
      setFavorites([]);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    const loadMosques = async () => {
      setLoading(true);
      try {
        let data = [];
        // 1. If coordinates are available (from GPS or selected city like Udgir)
        if (currentLocation?.lat && currentLocation?.lng) {
          const nearby = await mosqueService.getNearbyMosques({
            lat: currentLocation.lat,
            lng: currentLocation.lng,
            radius: 5,
          });
          if (Array.isArray(nearby) && nearby.length > 0) {
            data = nearby.slice(0, 6);
          }
        }

        // 2. If no nearby results or no coordinates, search by city name
        if ((!data || data.length === 0) && currentLocation?.city) {
          const cityResults = await mosqueService.getMosques({ city: currentLocation.city, limit: 6 });
          if (Array.isArray(cityResults) && cityResults.length > 0) {
            data = cityResults.slice(0, 6);
          }
          // If city is Pimpri-Chinchwad area, also check Pune metro
          if ((!data || data.length === 0) && (
            currentLocation.city.toLowerCase().includes('pimpri') ||
            currentLocation.city.toLowerCase().includes('chinchwad')
          )) {
            const puneResults = await mosqueService.getMosques({ city: 'Pune', limit: 6 });
            if (Array.isArray(puneResults) && puneResults.length > 0) {
              data = puneResults.slice(0, 6);
            }
          }
        }

        // 3. Only if NO location is specified at all, load general popular mosques
        if ((!data || data.length === 0) && !currentLocation?.city) {
          data = await mosqueService.getPopularMosques(6);
        }

        if (isMounted) setPopularMosques(data || []);
      } catch (err) {
        console.error('Failed to load popular mosques:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadMosques();
    return () => { isMounted = false; };
  }, [currentLocation]);

  const handleSearch = (query) => {
    if (!query || !query.trim()) {
      navigate('/mosques');
      return;
    }
    navigate(`/mosques?search=${encodeURIComponent(query.trim())}`);
  };

  const handleLocationSearch = async () => {
    if (currentLocation?.lat && currentLocation?.lng) {
      navigate(`/mosques?lat=${currentLocation.lat}&lng=${currentLocation.lng}`);
      return;
    }
    try {
      const coords = await requestLocation();
      if (coords?.lat && coords?.lng) {
        navigate(`/mosques?lat=${coords.lat}&lng=${coords.lng}`);
        return;
      }
    } catch (err) {
      console.warn('Geolocation request failed or denied:', err);
    }
    // Fallback if permission was denied or unavailable
    navigate('/mosques');
  };

  const handleFavoriteToggle = async (id) => {
    if (!user) {
      navigate('/login', {
        state: {
          from: '/',
          message: 'Please sign in or register to save mosques to your favorites.',
        },
      });
      return;
    }
    try {
      const res = await mosqueService.toggleFavorite(id);
      if (res?.favorite) {
        setFavorites((prev) => [...prev, id]);
      } else {
        setFavorites((prev) => prev.filter((favId) => favId !== id));
      }
    } catch (e) {
      console.error('Failed to toggle favorite:', e);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden py-16 sm:py-24">
        <div className="absolute inset-0 bg-islamic-pattern opacity-20 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-primary-100 text-xs font-semibold mb-6 border border-white/10 shadow-sm">
              <Sparkles size={14} className="text-accent-400" />
              <span>Open-Source Islamic Community Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight leading-tight">
              {t('home.hero_title') || 'Find Your Local Mosque & Prayer Times'}
            </h1>
            <p className="text-lg sm:text-xl text-primary-100/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              {t('home.hero_subtitle') || 'Explore verified mosques, daily congregation Iqamah timings, and community amenities across the world.'}
            </p>

            {/* Search Bar with integrated GPS Nearby button */}
            <div className="max-w-xl mx-auto">
              <SearchBar
                onSearch={handleSearch}
                onLocationSearch={handleLocationSearch}
                placeholder="Search by mosque name, city, or address (e.g. East London Mosque, Toronto)..."
                className="shadow-2xl"
                submitOnly={true}
                showLocationButton={true}
              />
            </div>



            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 mt-7">
              <Link
                to="/mosques"
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-800/80 hover:bg-primary-900 text-white rounded-xl transition-all text-sm font-semibold border border-white/20 shadow-md backdrop-blur-md"
              >
                <Compass size={16} className="text-accent-300" />
                <span>Explore Directory</span>
              </Link>
              <Link
                to="/mosques/add"
                className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-primary-50 text-primary-800 rounded-xl transition-all text-sm font-bold shadow-lg hover:shadow-xl"
              >
                <Plus size={16} className="text-primary-700" />
                <span>{t('nav.addMosque') || 'Add a Mosque'}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements Banner */}
      <section className="bg-primary-50 dark:bg-primary-950/40 border-b border-primary-200/50 dark:border-primary-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-center flex-wrap">
            <Megaphone size={16} className="text-primary-600 dark:text-primary-400 shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Friday Jumu&apos;ah Schedules:</strong> Multi-batch khutbah and prayer times now available for all registered mosques.
            </span>
            <Link to="/jumah" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold shrink-0">
              View Jumu&apos;ah Guide →
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Mosques Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
              <Star size={24} className="text-amber-400 fill-amber-400" />
              <span>
                {currentLocation?.city ? `Mosques in ${currentLocation.city}` : (t('home.popular') || 'Verified Community Mosques')}
              </span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {currentLocation?.city
                ? `Showing community mosques located in ${currentLocation.city}`
                : 'Top-rated and recently active mosques in our database'}
            </p>
          </div>
          <Link
            to="/mosques"
            className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors"
          >
            <span>View all</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                <div className="h-48 rounded-xl skeleton" />
                <div className="h-5 w-3/4 rounded skeleton" />
                <div className="h-4 w-1/2 rounded skeleton" />
                <div className="h-10 rounded skeleton" />
              </div>
            ))}
          </div>
        ) : popularMosques.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {popularMosques.map((mosque) => (
              <MosqueCard
                key={mosque.id || mosque.slug}
                mosque={mosque}
                onFavorite={handleFavoriteToggle}
                isFavorited={favorites.includes(mosque.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-2xl bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-3">
              <MapPin size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              No registered mosques found in {currentLocation?.city || 'your area'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-1 mb-6">
              Be the first in your community to add a mosque, or explore all mosques in our global directory.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/mosques/add"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all"
              >
                <Plus size={16} /> Add Mosque
              </Link>
              <Link
                to="/mosques"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs sm:text-sm font-semibold transition-all"
              >
                Explore All Mosques
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Features Showcase */}
      <section className="bg-gray-50 dark:bg-gray-900/60 border-y border-gray-200 dark:border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Built for Worshippers & Mosque Committees
            </h2>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-2">
              Everything you need for your daily congregational prayers and community connection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: 'Live Adhan & Iqamah Times',
                desc: 'Real-time astronomical calculation plus precise congregation Iqamah offsets configured by mosque trustees.',
              },
              {
                icon: MapPin,
                title: 'Geospatial Discovery & Amenities',
                desc: 'Filter by dedicated Women prayer halls, Wudu facilities, wheelchair ramps, and parking capacity.',
              },
              {
                icon: ShieldCheck,
                title: 'Crowdsourced & Verified',
                desc: 'Earn contributor reward points by adding mosques or suggesting corrections vetted by community moderators.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white dark:bg-gray-800 rounded-2xl p-7 text-center border border-gray-200 dark:border-gray-700 shadow-sm card-hover"
              >
                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center text-primary-600 dark:text-primary-400">
                  <f.icon size={28} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold mb-4">Know a mosque that should be listed?</h2>
            <p className="text-primary-100 text-base mb-8">
              Help your local community stay connected. Submit new mosques, update Iqamah times, and earn reward points.
            </p>
            <Link
              to="/mosques/add"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-primary-700 hover:bg-primary-50 rounded-xl font-bold transition-colors shadow-lg cursor-pointer text-sm"
            >
              <Plus size={18} />
              <span>Add a Mosque Now</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
