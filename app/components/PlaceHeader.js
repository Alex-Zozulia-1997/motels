import Link from 'next/link';

export default function PlaceHeader({ place, decision }) {
  if (!place) return null;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.title)}&query_place_id=${place.place_id}`;

  return (
    <>
      {/* Back button and status */}
      <div className="mb-1 flex justify-between items-center">
        <Link 
          href="/"
          className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
        >
          ← Back to List
        </Link>
        
        {decision && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Status:</span>
            {decision === 'approved' && (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                ✓ Approved
              </span>
            )}
            {decision === 'rejected' && (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                ✕ Rejected
              </span>
            )}
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-4 mb-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
              {place.title}
            </h1>
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <p className="text-zinc-600 dark:text-zinc-400">
                📍 {place.city}, {place.state} {place.country_code}
              </p>
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {place.total_score?.toFixed(1) || 'N/A'}
                </span>
              </div>
              <span className="text-zinc-600 dark:text-zinc-400">
                {place.reviews_count || 0} reviews
              </span>
              <span className="text-zinc-600 dark:text-zinc-400">
                {place.images_count || 0} images
              </span>
              {place.category_name && (
                <span className="text-zinc-600 dark:text-zinc-400">
                  🏷️ {place.category_name}
                </span>
              )}
            </div>
          </div>
          
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            🗺️ Google Maps
          </a>
        </div>
      </div>
    </>
  );
}
