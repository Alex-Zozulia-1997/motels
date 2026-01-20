export default function Filters({ filters, onFiltersChange, countries }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <input
        type="text"
        placeholder="Search motels..."
        className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
        value={filters.search}
        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
      />

      <select
        className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
        value={filters.country}
        onChange={(e) => onFiltersChange({ ...filters, country: e.target.value })}
      >
        <option value="">All Countries</option>
        {countries.map(code => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>

      <select
        className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
        value={filters.status}
        onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>

      <select
        className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
        value={filters.sortBy}
        onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
      >
        <option value="total_score">Sort by Rating</option>
        <option value="reviews_count">Sort by Reviews</option>
        <option value="title">Sort by Name</option>
        <option value="city">Sort by City</option>
      </select>

      <select
        className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
        value={filters.sortOrder}
        onChange={(e) => onFiltersChange({ ...filters, sortOrder: e.target.value })}
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
    </div>
  );
}
