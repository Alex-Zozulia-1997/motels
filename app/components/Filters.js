import { useState, useRef, useEffect } from 'react';

export default function Filters({ filters, onFiltersChange, countries }) {
  const handleCountryChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
    onFiltersChange({ ...filters, country: selected });
  };

  // Custom multi-select dropdown for countries
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCountryDropdownOpen(false);
      }
    };
    if (countryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [countryDropdownOpen]);

  const handleCountryToggle = () => {
    setCountryDropdownOpen((open) => !open);
  };

  const handleCountrySelect = (code) => {
    let selected = filters.country || [];
    if (selected.includes(code)) {
      selected = selected.filter(c => c !== code);
    } else {
      selected = [...selected, code];
    }
    onFiltersChange({ ...filters, country: selected });
  };

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <input
        type="text"
        placeholder="Search motels..."
        className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
        value={filters.search}
        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
      />

      <div>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            className="min-w-[160px] px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex justify-between items-center"
            onClick={handleCountryToggle}
          >
            <span>
              {(filters.country && filters.country.length > 0)
                ? filters.country.join(', ')
                : 'Select countries'}
            </span>
            <span className="ml-2 text-zinc-400">▼</span>
          </button>
          {countryDropdownOpen && (
            <div className="absolute left-0 mt-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded shadow-lg z-10">
              <div className="flex gap-2 px-3 py-2 border-b border-zinc-200 dark:border-zinc-700">
                <button
                  type="button"
                  className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded hover:bg-purple-200 dark:hover:bg-purple-800"
                  onClick={() => onFiltersChange({ ...filters, country: countries })}
                >
                  All Countries
                </button>
                <button
                  type="button"
                  className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  onClick={() => onFiltersChange({ ...filters, country: [] })}
                >
                  Clear
                </button>
              </div>
              {countries.map(code => (
                <div
                  key={code}
                  className={`px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-zinc-800 ${
                    filters.country && filters.country.includes(code)
                      ? 'bg-purple-100 dark:bg-purple-900'
                      : ''
                  }`}
                  onClick={() => handleCountrySelect(code)}
                >
                  <input
                    type="checkbox"
                    checked={filters.country && filters.country.includes(code)}
                    readOnly
                  />
                  <span>{code}</span>
                </div>
              ))}
            </div>
          )}
        </div>
       
      </div>

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
