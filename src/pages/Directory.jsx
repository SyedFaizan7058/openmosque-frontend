import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Map, List, MapPin, SearchX, RefreshCw, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import SearchBar from '../components/common/SearchBar';
import FilterPanel from '../components/discovery/FilterPanel';
import MosqueList from '../components/discovery/MosqueList';
import MapView from '../components/discovery/MapView';
import { useGeolocation } from '../hooks';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import mosqueService from '../services/mosqueService';

const PAGE_SIZE = 12;

export default function Directory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const locationHook = useLocation();
  const { user } = useAuth();
  const { location, requestLocation } = useGeolocation();

  const [mosques, setMosques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [favorites, setFavorites] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user) {
      mosqueService.getFavorites()
        .then((favs) => setFavorites((favs || []).map((f) => f.mosqueId || f.id)))
        .catch(() => setFavorites([]));
    } else {
      setFavorites([]);
    }
  }, [user]);

  const { currentLocation, openLocationModal, setLocation } = useLocationContext();

  const currentSearch = searchParams.get('search') || searchParams.get('q') || '';
  const currentCity = searchParams.get('city') || currentLocation?.city || '';
  const currentSort = searchParams.get('sort') || 'relevance';
  const currentFacilities = searchParams.get('facilities') ? searchParams.get('facilities').split(',') : [];

  const [filters, setFilters] = useState({
    city: currentCity,
    sort: currentSort,
    facilities: currentFacilities,
  });

  const hasSecondaryFilters = Boolean(
    currentSearch ||
    (filters.facilities && filters.facilities.length > 0) ||
    (filters.sort && filters.sort !== 'relevance') ||
    (filters.city && filters.city !== 'All' && filters.city !== (currentLocation?.city || ''))
  );

  // Sync filters immediately whenever location changes or resets
  useEffect(() => {
    const activeCity = currentLocation?.city || '';
    setFilters(prev => ({ ...prev, city: activeCity }));
  }, [currentLocation]);

  // Reset page to 0 when filters or search change
  useEffect(() => {
    setPage(0);
  }, [currentSearch, filters.city, filters.facilities, filters.sort]);

  // Fetch mosques from actual backend DB
  const fetchMosques = useCallback(async () => {
    setLoading(true);
    try {
      const latParam = searchParams.get('lat') || (currentLocation?.lat ? currentLocation.lat : null);
      const lngParam = searchParams.get('lng') || (currentLocation?.lng ? currentLocation.lng : null);

      let data;
      // If explicit lat/lng passed and no keyword search active, prioritize spatial nearby search (5km range)
      if (latParam && lngParam && !currentSearch) {
        data = await mosqueService.getNearbyMosques({
          lat: parseFloat(latParam),
          lng: parseFloat(lngParam),
          radius: 5,
          facilities: filters.facilities,
        });
        setTotalCount(data.length);
        setTotalPages(1);
      } else {
        data = await mosqueService.getMosques({
          search: currentSearch,
          city: filters.city,
          facilities: filters.facilities,
          sort: filters.sort,
          page: page,
          limit: PAGE_SIZE,
        });
        setTotalCount(data.totalElements !== undefined ? data.totalElements : data.length);
        setTotalPages(data.totalPages !== undefined ? data.totalPages : 1);
      }
      setMosques(data);
    } catch (err) {
      console.error('Error fetching mosques from database:', err);
    } finally {
      setLoading(false);
    }
  }, [currentLocation, currentSearch, filters.city, filters.facilities, filters.sort, page, searchParams]);

  useEffect(() => {
    fetchMosques();
  }, [fetchMosques]);

  const handleSearch = (query) => {
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleLocationSearch = async () => {
    try {
      if (currentLocation?.lat && currentLocation?.lng) {
        const params = new URLSearchParams(searchParams);
        params.set('lat', currentLocation.lat);
        params.set('lng', currentLocation.lng);
        params.delete('city');
        setSearchParams(params);
        return;
      }
      const coords = await requestLocation();
      if (coords?.lat && coords?.lng) {
        const params = new URLSearchParams(searchParams);
        params.set('lat', coords.lat);
        params.set('lng', coords.lng);
        params.delete('city'); // Clear city filter when user clicks nearby GPS
        setSearchParams(params);
      }
    } catch (err) {
      console.warn('Directory GPS request failed:', err);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    const params = new URLSearchParams(searchParams);
    if (newFilters.city) params.set('city', newFilters.city);
    else params.delete('city');

    if (newFilters.sort) params.set('sort', newFilters.sort);
    else params.delete('sort');

    if (newFilters.facilities?.length) params.set('facilities', newFilters.facilities.join(','));
    else params.delete('facilities');

    setSearchParams(params);
  };

  const handleClearFilters = () => {
    const defaultCity = currentLocation?.city || '';
    setFilters({ city: defaultCity, sort: 'relevance', facilities: [] });
    const params = new URLSearchParams();
    if (defaultCity) {
      params.set('city', defaultCity);
    }
    setSearchParams(params);
  };


  const handleFavoriteToggle = async (id) => {
    if (!user) {
      navigate('/login', {
        state: {
          from: locationHook.pathname + locationHook.search,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Mosque Directory
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Explore authentic verified mosques, congregational Iqamah schedules, and community amenities
            </p>
          </div>
          <button
            type="button"
            onClick={fetchMosques}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh DB</span>
          </button>
        </div>

        {/* Search Bar */}
        <SearchBar
          onSearch={handleSearch}
          onLocationSearch={handleLocationSearch}
          placeholder="Search by mosque name, city, or address..."
          initialValue={currentSearch}
        />

        {/* Dynamic Location Indicator */}
        {currentLocation?.city ? (
          <div className="flex items-center gap-2 mt-3 py-1.5 px-3.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 text-xs text-primary-800 dark:text-primary-200 w-fit">
            <MapPin size={14} className="text-primary-600 dark:text-primary-400 shrink-0" />
            <span>
              Showing mosques near: <strong>{currentLocation.city}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setLocation(null);
                const params = new URLSearchParams(searchParams);
                params.delete('city');
                params.delete('lat');
                params.delete('lng');
                setSearchParams(params);
              }}
              className="ml-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 font-semibold underline cursor-pointer"
            >
              Show all
            </button>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <button
              type="button"
              onClick={openLocationModal}
              className="text-primary-600 dark:text-primary-400 hover:underline cursor-pointer font-medium"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-3 py-1.5 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300 w-fit">
            <MapPin size={14} className="text-gray-400 shrink-0" />
            <span>Showing all available mosques</span>
            <button
              type="button"
              onClick={openLocationModal}
              className="ml-2 text-primary-600 dark:text-primary-400 hover:underline cursor-pointer font-semibold"
            >
              Select your location
            </button>
          </div>
        )}
      </div>

      {/* Toolbar & Controls */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClear={handleClearFilters}
          />
          <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
            {loading ? 'Searching database...' : `${totalCount} mosque${totalCount !== 1 ? 's' : ''} found`}
          </span>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
            aria-label="List view"
          >
            <List size={18} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'map'
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
            aria-label="Map view"
          >
            <Map size={18} />
          </button>
        </div>
      </div>

      {/* Content View */}
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
      ) : mosques.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
          <SearchX size={48} className="mx-auto text-gray-400 mb-4" />
          {hasSecondaryFilters ? (
            <>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                No mosques matching filters
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1 mb-6">
                No mosques {filters.city ? `in ${filters.city}` : ''} match your selected search or amenity criteria.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
              >
                Clear Search &amp; Filters
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                No mosques found in {filters.city || 'this area'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-1 mb-6">
                There are currently no registered mosques in {filters.city || 'this city'} in our database. You can contribute by adding the first mosque, change your location, or browse all mosques worldwide.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/mosques/add"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
                >
                  <Plus size={16} />
                  <span>Add a Mosque in {filters.city || 'your city'}</span>
                </Link>
                <button
                  type="button"
                  onClick={openLocationModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  <MapPin size={15} />
                  <span>Change Location</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickCity('All')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  <span>Browse All Cities (Worldwide)</span>
                </button>
              </div>
            </>
          )}
        </div>
      ) : viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="h-[650px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 sticky top-20 shadow-md">
            <MapView mosques={mosques} center={location} />
          </div>
          <div className="overflow-y-auto max-h-[650px] pr-1 space-y-4">
            <MosqueList
              mosques={mosques}
              loading={loading}
              onFavorite={handleFavoriteToggle}
              favorites={favorites}
            />
            {totalPages > 1 && (
              <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Page {page + 1} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                    className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <MosqueList
            mosques={mosques}
            loading={loading}
            onFavorite={handleFavoriteToggle}
            favorites={favorites}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Showing <strong className="font-semibold text-gray-900 dark:text-white">{page * PAGE_SIZE + 1}</strong> to{' '}
                <strong className="font-semibold text-gray-900 dark:text-white">
                  {Math.min((page + 1) * PAGE_SIZE, totalCount)}
                </strong> of{' '}
                <strong className="font-semibold text-gray-900 dark:text-white">{totalCount}</strong> mosques
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => {
                    setPage(p => Math.max(0, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300 shadow-sm"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    // Show first, last, current, and adjacent pages
                    if (
                      idx === 0 ||
                      idx === totalPages - 1 ||
                      Math.abs(idx - page) <= 1
                    ) {
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setPage(idx);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-9 h-9 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                            idx === page
                              ? 'bg-primary-500 text-white shadow-sm'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    }
                    if (idx === page - 2 || idx === page + 2) {
                      return (
                        <span key={idx} className="px-1 text-gray-400 dark:text-gray-500">
                          …
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  type="button"
                  disabled={page >= totalPages - 1}
                  onClick={() => {
                    setPage(p => p + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300 shadow-sm"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
