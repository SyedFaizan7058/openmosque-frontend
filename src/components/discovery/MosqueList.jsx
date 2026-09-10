import MosqueCard from './MosqueCard';
import { Mosque } from 'lucide-react';

export default function MosqueList({ mosques = [], loading, onFavorite, favorites = [] }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="skeleton h-48 w-full" />
            <div className="p-4 space-y-3">
              <div className="skeleton h-5 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
              <div className="skeleton h-3 w-full rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!mosques.length) {
    return (
      <div className="text-center py-16">
        <Mosque size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No mosques found</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mosques.map((mosque) => (
        <MosqueCard
          key={mosque.id}
          mosque={mosque}
          onFavorite={onFavorite}
          isFavorited={favorites.includes(mosque.id)}
        />
      ))}
    </div>
  );
}
