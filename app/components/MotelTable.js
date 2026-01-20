import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MotelTable({ motels, decisions, onValidateClick, loading }) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-2"></div>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Loading motels...</span>
        </div>
      </div>
    );
  }

  if (motels.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">No Motels Found</h2>
        <p className="text-zinc-600 dark:text-zinc-400">Try adjusting your filters</p>
      </div>
    );
  }

  const handleRowClick = (placeId) => {
    onValidateClick(placeId);
    router.push(`/validate/${placeId}`);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Motel Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Rating
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Reviews
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Images
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {motels.map((motel) => {
            const status = decisions[motel.place_id];
            const imageCount = motel.images_count || 0;
            
            return (
              <tr 
                key={motel.place_id}
                onClick={() => handleRowClick(motel.place_id)}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {status === 'approved' && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      ✓ Approved
                    </span>
                  )}
                  {status === 'rejected' && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      ✕ Rejected
                    </span>
                  )}
                  {!status && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      ⋯ Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {motel.title}
                  </div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    {motel.address}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-50">
                  {motel.city}, {motel.state}
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {motel.country_code}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">⭐</span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {motel.total_score?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-50">
                  {motel.reviews_count || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-zinc-900 dark:text-zinc-50">
                    <span className="mr-1">📷</span>
                    <span>{imageCount}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
