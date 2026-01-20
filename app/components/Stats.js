export default function Stats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.total}</div>
        <div className="text-sm text-zinc-600 dark:text-zinc-400">Total</div>
      </div>
      <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.approved}</div>
        <div className="text-sm text-green-600 dark:text-green-500">Approved</div>
      </div>
      <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.rejected}</div>
        <div className="text-sm text-red-600 dark:text-red-500">Rejected</div>
      </div>
      <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded-lg">
        <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.pending}</div>
        <div className="text-sm text-yellow-600 dark:text-yellow-500">Pending</div>
      </div>
    </div>
  );
}
