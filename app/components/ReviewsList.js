export default function ReviewsList({ reviews }) {
  if (reviews.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          💬 Reviews
        </h2>
        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
          <div className="text-4xl mb-2">💭</div>
          <p>No reviews available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
        💬 Reviews ({reviews.length})
      </h2>
      
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {reviews.map((review) => (
          <div 
            key={review.review_url || review.reviewer_id || review.published_at}
            className="border-b border-zinc-200 dark:border-zinc-700 pb-4 last:border-b-0"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {review.reviewer_name || 'Anonymous'}
                  </p>
                  {review.is_local_guide && (
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">
                      Local Guide
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <span className="text-yellow-500">
                    {'⭐'.repeat(review.stars || 0)}
                  </span>
                  {review.published_at && (
                    <span>
                      {new Date(review.published_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              {review.likes_count > 0 && (
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  👍 {review.likes_count}
                </div>
              )}
            </div>
            
            {review.text && (
              <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">
                {review.text}
              </p>
            )}

            {review.text_translated && review.text_translated !== review.text && (
              <details className="text-sm">
                <summary className="cursor-pointer text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                  View Translation
                </summary>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400 italic">
                  {review.text_translated}
                </p>
              </details>
            )}

            {review.review_url && (
              <a
                href={review.review_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 mt-1 inline-block"
              >
                View on Google →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
