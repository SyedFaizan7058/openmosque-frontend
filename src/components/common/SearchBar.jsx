import { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { debounce } from '../../utils/helpers';

export default function SearchBar({
  onSearch,
  onLocationSearch,
  placeholder = 'Search by mosque name or location...',
  showLocationButton = true,
  autoFocus = false,
  className = '',
  initialValue = '',
  submitOnly = false,
}) {
  const [query, setQuery] = useState(initialValue);
  const inputRef = useRef(null);

  useEffect(() => {
    setQuery(initialValue || '');
  }, [initialValue]);

  const debouncedSearch = useRef(
    debounce((value) => {
      onSearch?.(value);
    }, 300)
  ).current;

  useEffect(() => {
    return () => debouncedSearch.cancel?.();
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (!submitOnly) {
      debouncedSearch(value);
    }
  };

  const handleClear = () => {
    setQuery('');
    onSearch?.('');
    inputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            placeholder={placeholder}
            autoFocus={autoFocus}
            aria-label={placeholder}
            className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {showLocationButton && onLocationSearch && (
          <button
            type="button"
            onClick={onLocationSearch}
            className="flex items-center gap-2 px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors text-sm font-medium shrink-0"
            aria-label="Find nearby mosques"
          >
            <MapPin size={16} />
            <span className="hidden sm:inline">Nearby</span>
          </button>
        )}
      </div>
    </form>
  );
}
