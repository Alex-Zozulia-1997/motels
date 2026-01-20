'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PlaceHeader from '@/app/components/PlaceHeader';
import ImageGallery from '@/app/components/ImageGallery';
import ReviewsList from '@/app/components/ReviewsList';
import DecisionButtons from '@/app/components/DecisionButtons';

export default function ValidatePage({ params }) {
  const router = useRouter();
  const [placeId, setPlaceId] = useState(null);
  const [place, setPlace] = useState(null);
  const [images, setImages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState(null);

  useEffect(() => {
    // Unwrap the params promise in Next.js 15+
    const loadParams = async () => {
      if (params) {
        // In Next.js 15, params itself might be a Promise
        const resolvedParams = params instanceof Promise ? await params : params;
        if (resolvedParams?.place_id) {
          setPlaceId(resolvedParams.place_id);
        }
      }
    };
    
    loadParams();
  }, [params]);

  useEffect(() => {
    if (placeId) {
      fetchPlaceData();
    }
  }, [placeId]);

  const fetchPlaceData = async () => {
    setLoading(true);

    try {
      // Add a timeout helper
      const withTimeout = (promise, ms) => {
        return Promise.race([
          promise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout fetching images')), ms)
          )
        ]);
      };

      // Only fetch needed columns
      const [placeResult, imagesResult, reviewsResult, decisionResult] = await Promise.all([
        supabase
          .from('places')
          .select('place_id,title,address,city,state,country_code,lat,lng,category_name,categories,total_score,reviews_count,images_count,url,raw,created_at,updated_at')
          .eq('place_id', placeId)
          .single(),
        // Increase timeout for images to 20 seconds
        withTimeout(
          supabase
            .from('place_images')
            .select('image_url,author_name,author_url,uploaded_at,position,category')
            .eq('place_id', placeId)
            .order('position', { ascending: true })
            .limit(20),
          20000
        ),
        supabase
          .from('place_reviews')
          .select('stars,text,text_translated,published_at,reviewer_name,reviewer_id,reviewer_url,likes_count,is_local_guide,review_url')
          .eq('place_id', placeId)
          .order('likes_count', { ascending: false })
          .order('published_at', { ascending: false })
          .limit(10),
        supabase
          .from('decisions')
          .select('decision')
          .eq('place_id', placeId)
          .maybeSingle()
      ]);

      if (placeResult.error) {
        console.error('Error fetching place:', placeResult.error);
        setLoading(false);
        return;
      }

      const placeData = placeResult.data;
      setPlace(placeData);

      // Images: fetch initial batch, then fetch all in background
      if (!imagesResult.error && imagesResult.data && imagesResult.data.length > 0) {
        setImages(imagesResult.data);

        // Fetch all images in background and update when ready
        supabase
          .from('place_images')
          .select('image_url,author_name,author_url,uploaded_at,position,category')
          .eq('place_id', placeId)
          .order('position', { ascending: true })
          .then(({ data: allImages, error }) => {
            if (!error && allImages && allImages.length > imagesResult.data.length) {
              setImages(allImages);
            }
            // Only set loading to false after all images are fetched
            setLoading(false);
          });
      } else if (placeData.raw?.imagesData && Array.isArray(placeData.raw.imagesData)) {
        const rawImages = placeData.raw.imagesData;
        const allEmpty = rawImages.every(img => !img.image_url || img.image_url.trim() === '');
        setImages(allEmpty ? [] : rawImages);
        setLoading(false);
      } else {
        setImages([]);
        setLoading(false);
      }

      if (!reviewsResult.error && reviewsResult.data) {
        setReviews(reviewsResult.data);
      }

      if (decisionResult.data) {
        setDecision(decisionResult.data.decision);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleDecision = async (newDecision) => {
    try {
      // Save to Supabase with better error handling
      const { data, error } = await supabase
        .from('decisions')
        .upsert({
          place_id: placeId,
          decision: newDecision,
          decided_at: new Date().toISOString(),
        }, {
          onConflict: 'place_id' // Specify the conflict column
        })
        .select();

      if (error) {
        console.error('Error saving decision:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        alert(`Failed to save decision: ${error.message || 'Unknown error'}`);
        return;
      }

      console.log('Decision saved successfully:', data);

      // Save to localStorage
      const saved = localStorage.getItem('motel_decisions');
      const decisions = saved ? JSON.parse(saved) : {};
      decisions[placeId] = newDecision;
      localStorage.setItem('motel_decisions', JSON.stringify(decisions));

      setDecision(newDecision);

      // Navigate to next pending motel
      await navigateToNext();
    } catch (err) {
      console.error('Unexpected error in handleDecision:', err);
      alert(`Unexpected error: ${err.message}`);
    }
  };

  const navigateToNext = async () => {
    // Try to get the filtered list from sessionStorage first
    const filteredListJson = sessionStorage.getItem('motel_filtered_list');
    
    if (filteredListJson) {
      try {
        const filteredList = JSON.parse(filteredListJson);
        const currentIndex = filteredList.findIndex(id => id === placeId);
        
        if (currentIndex !== -1 && currentIndex < filteredList.length - 1) {
          // Navigate to next item in the filtered list
          router.push(`/validate/${filteredList[currentIndex + 1]}`);
          return;
        } else if (currentIndex !== -1 && currentIndex === filteredList.length - 1) {
          // At the end of the filtered list, go back to main list
          router.push('/');
          return;
        }
      } catch (e) {
        console.error('Error parsing filtered list:', e);
      }
    }

    // Fallback: find next pending item from database
    const { data: pendingPlaces, error } = await supabase
      .from('places')
      .select('place_id, total_score')
      .order('total_score', { ascending: false })
      .limit(100);

    if (error || !pendingPlaces) {
      router.push('/');
      return;
    }

    const placeIds = pendingPlaces.map(p => p.place_id);
    const { data: decisions } = await supabase
      .from('decisions')
      .select('place_id')
      .in('place_id', placeIds);

    const decidedIds = new Set(decisions?.map(d => d.place_id) || []);
    
    const currentIndex = pendingPlaces.findIndex(p => p.place_id === placeId);
    
    for (let i = currentIndex + 1; i < pendingPlaces.length; i++) {
      if (!decidedIds.has(pendingPlaces[i].place_id)) {
        router.push(`/validate/${pendingPlaces[i].place_id}`);
        return;
      }
    }

    router.push('/');
  };

  const navigateToPrevious = async () => {
    // Try to get the filtered list from sessionStorage first
    const filteredListJson = sessionStorage.getItem('motel_filtered_list');
    
    if (filteredListJson) {
      try {
        const filteredList = JSON.parse(filteredListJson);
        const currentIndex = filteredList.findIndex(id => id === placeId);
        
        if (currentIndex > 0) {
          // Navigate to previous item in the filtered list
          router.push(`/validate/${filteredList[currentIndex - 1]}`);
          return;
        } else if (currentIndex === 0) {
          // At the beginning of the filtered list, go back to main list
          router.push('/');
          return;
        }
      } catch (e) {
        console.error('Error parsing filtered list:', e);
      }
    }

    // Fallback: go back to list
    router.push('/');
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-zinc-50 dark:bg-black">
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-50 pointer-events-none">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4 opacity-80"></div>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 opacity-80">Loading place...</p>
          </div>
        </div>
        {/* Optionally render a blurred/skeleton version of the previous content here */}
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Place Not Found</h2>
          <a href="/" className="text-purple-600 hover:text-purple-800 dark:text-purple-400">
            ← Back to List
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-4 px-4">
      <div className="max-w-7xl mx-auto">
        <PlaceHeader place={place} decision={decision} />

        {/* Main Content: Images + Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <ImageGallery images={images} placeTitle={place.title} />
          <ReviewsList reviews={reviews} />
        </div>

        <DecisionButtons 
          decision={decision}
          onDecision={handleDecision}
          onSkipToNext={navigateToNext}
          onPrevious={navigateToPrevious}
        />
      </div>
    </div>
  );
}
