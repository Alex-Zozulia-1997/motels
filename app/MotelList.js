'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Stats from './components/Stats';
import StatsModal from './components/StatsModal';
import Filters from './components/Filters';
import MotelTable from './components/MotelTable';
import Pagination from './components/Pagination';
import ValidateModal from './components/ValidateModal';

const ITEMS_PER_PAGE = 50;
const FILTERS_KEY = 'motel_list_filters';
const LOCAL_DECISIONS_KEY = 'motel_decisions';

export default function MotelList() {
  // Avoid localStorage access during SSR
  const [filters, setFilters] = useState({
    country: [], // now an array
    status: 'all',
    search: '',
    sortBy: 'reviews_count',
    sortOrder: 'desc'
  });
  const [statsModalOpen, setStatsModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(FILTERS_KEY);
      if (saved) {
        setFilters(JSON.parse(saved));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
    }
  }, [filters]);

  const [motels, setMotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredMotels, setFilteredMotels] = useState([]);
  const [validateModalId, setValidateModalId] = useState(null);

  const filteredPlaceIds = filteredMotels.map(m => m.place_id);

  useEffect(() => {
    fetchMotelsFromSummary();
  }, []);

  const fetchMotelsFromSummary = async () => {
    setLoading(true);
    let allData = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('place_summary')
        .select('*')
        .range(from, from + batchSize - 1);

      if (error) {
        setMotels([]);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        allData = [...allData, ...data];
        from += batchSize;
        hasMore = data.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    setMotels(allData);
    setLoading(false);
  };

  // Filter and sort motels whenever dependencies change
  useEffect(() => {
    let filtered = [...motels];
    if (filters.country && filters.country.length > 0) {
      filtered = filtered.filter(m => filters.country.includes(m.country_code));
    }
    if (filters.status === 'pending') {
      filtered = filtered.filter(m => !m.decision || m.decision === 'pending');
    } else if (filters.status === 'approved') {
      filtered = filtered.filter(m => m.decision === 'approved');
    } else if (filters.status === 'rejected') {
      filtered = filtered.filter(m => m.decision === 'rejected');
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(m =>
        m.title?.toLowerCase().includes(searchLower) ||
        m.city?.toLowerCase().includes(searchLower) ||
        m.address?.toLowerCase().includes(searchLower)
      );
    }
    filtered.sort((a, b) => {
      const aVal = a[filters.sortBy] || 0;
      const bVal = b[filters.sortBy] || 0;
      if (filters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
    setFilteredMotels(filtered);
    setCurrentPage(1);
  }, [motels, filters]);

  // On each load, clear localStorage decisions and re-populate from DB
  useEffect(() => {
    localStorage.removeItem(LOCAL_DECISIONS_KEY);
  }, []);

  const [localDecisions, setLocalDecisions] = useState({});

  // When motels are loaded, initialize localDecisions from DB/view
  useEffect(() => {
    if (motels.length > 0) {
      const initial = {};
      motels.forEach(m => {
        if (m.decision) initial[m.place_id] = m.decision;
      });
      setLocalDecisions(initial);
      localStorage.setItem(LOCAL_DECISIONS_KEY, JSON.stringify(initial));
    }
  }, [motels]);

  // When a decision is made in ValidateModal, update localDecisions immediately
  const updateDecisionInList = (placeId, newDecision) => {
    setLocalDecisions(prev => {
      const updated = { ...prev, [placeId]: newDecision };
      localStorage.setItem(LOCAL_DECISIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const stats = useMemo(() => {
    const approved = Object.values(localDecisions).filter(d => d === 'approved').length;
    const rejected = Object.values(localDecisions).filter(d => d === 'rejected').length;
    const pending = motels.length - approved - rejected;
    return { approved, rejected, pending, total: motels.length };
  }, [localDecisions, motels]);

  const filteredStats = useMemo(() => {
    const filteredPlaceIds = filteredMotels.map(m => m.place_id);
    const approved = filteredPlaceIds.filter(id => localDecisions[id] === 'approved').length;
    const rejected = filteredPlaceIds.filter(id => localDecisions[id] === 'rejected').length;
    const pending = filteredMotels.length - approved - rejected;
    return { approved, rejected, pending, total: filteredMotels.length };
  }, [filteredMotels, localDecisions]);

  const countries = useMemo(() => 
    [...new Set(motels.map(m => m.country_code).filter(Boolean))].sort()
  , [motels]);

  const totalPages = Math.ceil(filteredMotels.length / ITEMS_PER_PAGE);
  const paginatedMotels = filteredMotels.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Pass a new handler to MotelTable for row clicks
  const handleRowClick = (placeId) => {
    setValidateModalId(placeId);
  };

  const handleValidateClick = (placeId) => {
    // Go to the validate page as before
    window.location.href = `/validate/${placeId}`;
  };

  const exportToCSV = async () => {
    
    try {
      const placeIds = filteredMotels.map(m => m.place_id);
      
      // Fetch ALL images and reviews (not limited)
      const fetchAllImages = async () => {
        let allImages = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from('place_images')
            .select('*')
            .in('place_id', placeIds)
            .order('place_id')
            .order('position', { ascending: true })
            .range(from, from + batchSize - 1);

          if (error || !data || data.length === 0) {
            hasMore = false;
          } else {
            allImages = [...allImages, ...data];
            from += batchSize;
            hasMore = data.length === batchSize;
          }
        }
        return allImages;
      };

      const fetchAllReviews = async () => {
        let allReviews = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from('place_reviews')
            .select('*')
            .in('place_id', placeIds)
            .order('place_id')
            .order('likes_count', { ascending: false })
            .range(from, from + batchSize - 1);

          if (error || !data || data.length === 0) {
            hasMore = false;
          } else {
            allReviews = [...allReviews, ...data];
            from += batchSize;
            hasMore = data.length === batchSize;
          }
        }
        return allReviews;
      };

      const [allImages, allReviews] = await Promise.all([
        fetchAllImages(),
        fetchAllReviews()
      ]);

      console.log(`Fetched ${allImages.length} images and ${allReviews.length} reviews`);

      const imagesByPlace = {};
      const reviewsByPlace = {};
      
      allImages.forEach(img => {
        if (!imagesByPlace[img.place_id]) {
          imagesByPlace[img.place_id] = [];
        }
        imagesByPlace[img.place_id].push(img);
      });
      
      allReviews.forEach(review => {
        if (!reviewsByPlace[review.place_id]) {
          reviewsByPlace[review.place_id] = [];
        }
        reviewsByPlace[review.place_id].push(review);
      });

      const maxImages = Math.max(...filteredMotels.map(m => (imagesByPlace[m.place_id] || []).length), 0);
      const maxReviews = Math.max(...filteredMotels.map(m => (reviewsByPlace[m.place_id] || []).length), 0);

      const baseHeaders = [
        'Place ID', 'Title', 'Address', 'City', 'State', 'Country Code', 'Postal Code',
        'Latitude', 'Longitude', 'Category Name', 'Categories', 'Rating', 'Reviews Count',
        'Images Count', 'Actual Images Count', 'Actual Reviews Count', 'Google Maps URL',
        'Status', 'Phone', 'Website', 'Average Star Rating', 'Star Distribution (5-4-3-2-1)',
        'Created At', 'Updated At'
      ];

      const imageHeaders = [];
      for (let i = 1; i <= maxImages; i++) {
        imageHeaders.push(`Image${i}_URL`, `Image${i}_Author`);
      }

      const reviewHeaders = [];
      for (let i = 1; i <= maxReviews; i++) {
        reviewHeaders.push(
          `Review${i}_Stars`, `Review${i}_Text`, `Review${i}_Author`,
          `Review${i}_Likes`, `Review${i}_Date`, `Review${i}_IsLocalGuide`
        );
      }

      const headers = [...baseHeaders, ...imageHeaders, ...reviewHeaders];

      const rows = filteredMotels.map(motel => {
        const images = imagesByPlace[motel.place_id] || [];
        const reviews = reviewsByPlace[motel.place_id] || [];
        
        const starCounts = [0, 0, 0, 0, 0];
        reviews.forEach(r => {
          if (r.stars >= 1 && r.stars <= 5) {
            starCounts[r.stars - 1]++;
          }
        });
        const starDistribution = `${starCounts[4]}-${starCounts[3]}-${starCounts[2]}-${starCounts[1]}-${starCounts[0]}`;
        const avgStars = reviews.length > 0
          ? (reviews.reduce((sum, r) => sum + (r.stars || 0), 0) / reviews.length).toFixed(1)
          : '';

        const baseData = [
          motel.place_id || '', motel.title || '', motel.address || '', motel.city || '',
          motel.state || '', motel.country_code || '', motel.raw?.postalCode || '',
          motel.lat || '', motel.lng || '', motel.category_name || '',
          motel.categories?.join('; ') || '', motel.total_score?.toFixed(1) || '',
          motel.reviews_count || '', motel.images_count || '', images.length, reviews.length,
          motel.url || '', decisions[motel.place_id] || 'pending',
          motel.raw?.phone || '', motel.raw?.website || '', avgStars, starDistribution,
          motel.created_at ? new Date(motel.created_at).toISOString() : '',
          motel.updated_at ? new Date(motel.updated_at).toISOString() : ''
        ];

        const imageData = [];
        for (let i = 0; i < maxImages; i++) {
          const img = images[i];
          imageData.push(img ? img.image_url || '' : '', img ? img.author_name || '' : '');
        }

        const reviewData = [];
        for (let i = 0; i < maxReviews; i++) {
          const review = reviews[i];
          if (review) {
            reviewData.push(
              review.stars || '', review.text?.replace(/[\n\r]/g, ' ') || '',
              review.reviewer_name || '', review.likes_count || '',
              review.published_at ? new Date(review.published_at).toISOString() : '',
              review.is_local_guide ? 'Yes' : 'No'
            );
          } else {
            reviewData.push('', '', '', '', '', '');
          }
        }

        return [...baseData, ...imageData, ...reviewData];
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => {
          const stringCell = String(cell || '');
          if (stringCell.includes(',') || stringCell.includes('"') || stringCell.includes('\n')) {
            return `"${stringCell.replace(/"/g, '""')}"`;
          }
          return stringCell;
        }).join(','))
      ].join('\n');

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `motels_export_${filters.status}_${timestamp}.csv`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      
      console.log(`Exported ${filteredMotels.length} motels with ${allImages.length} total images (max ${maxImages} per place) and ${allReviews.length} total reviews (max ${maxReviews} per place)`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV: ' + error.message);
    } 
  };

  // Log every render
  console.log('=== Component Render ===');
  console.log('filteredMotels.length at render:', filteredMotels.length);

  // Listen for changes to localStorage (e.g., after decision in /validate/[place_id])
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === 'motel_decisions') {
        // Always reload from DB, not just localStorage
        loadDecisions();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Make sure loadDecisions is defined before this useEffect
  const loadDecisions = async () => {
    // ...existing code for loading decisions...
  };

  useEffect(() => {
    // Only update decisions from DB when returning to the list
    const handleFocus = () => {
      loadDecisions();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

 

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-6 px-4">
      <div className="max-w-8xl mx-auto relative">
    

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              🏨 Motel Database
            </h1>
            <button
              onClick={exportToCSV}
              disabled={filteredMotels.length === 0}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <span>📥 Export CSV (</span>
              <span>{filteredMotels.length}</span>
              <span>)</span>
            </button>
             <button
                      onClick={() => setStatsModalOpen(true)}
                      className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-2"
                    >
                      📊 View Charts
                    </button>
          </div>

          <Stats 
        stats={stats} 
        filteredStats={filteredStats}
        hasCountryFilter={filters.country && filters.country.length > 0}
      />
          <Filters filters={filters} onFiltersChange={setFilters} countries={countries} />
        </div>
        {loading && (
          <div className="mb-4 text-zinc-600 dark:text-zinc-400">
            LOADING MOTELS...
          </div>
        )}
        {!loading && (
        <div className="mb-4 text-zinc-600 dark:text-zinc-400">
          Showing {paginatedMotels.length} of {filteredMotels.length} motels
        </div>)}

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden mb-6">
          <MotelTable 
            motels={paginatedMotels} 
            decisions={localDecisions}
            onValidateClick={handleValidateClick}
            onRowClick={handleRowClick}
            loading={loading}
          />
        </div>

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
      <ValidateModal
        placeId={validateModalId}
        open={!!validateModalId}
        onClose={() => setValidateModalId(null)}
        filteredList={filteredPlaceIds}
        updateDecisionInList={updateDecisionInList}
      />
      <StatsModal
        open={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
        motels={motels}
        decisions={localDecisions}
      />
    </div>
  );
}

