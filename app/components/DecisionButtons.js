export default function DecisionButtons({ decision, onDecision, onSkipToNext, onPrevious }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
      <div className="flex gap-4 mb-4">
        {onPrevious && (
          <button
            onClick={onPrevious}
            className="flex-1 py-3 px-6 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors font-semibold"
          >
            ← Previous
          </button>
        )}
        <button
          onClick={() => onDecision('approved')}
          className={`flex-1 py-3 px-6 rounded-lg transition-colors font-semibold ${
            decision === 'approved'
              ? 'bg-green-600 text-white'
              : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40'
          }`}
        >
          ✓ Approve
        </button>
        <button
          onClick={() => onDecision('rejected')}
          className={`flex-1 py-3 px-6 rounded-lg transition-colors font-semibold ${
            decision === 'rejected'
              ? 'bg-red-600 text-white'
              : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40'
          }`}
        >
          ✕ Reject
        </button>
        <button
          onClick={onSkipToNext}
          className="flex-1 py-3 px-6 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors font-semibold"
        >
          Skip to Next →
        </button>
      </div>
    </div>
  );
}
