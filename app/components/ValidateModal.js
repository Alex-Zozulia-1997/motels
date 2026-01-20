import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PlaceHeader from './PlaceHeader';
import ImageGallery from './ImageGallery';
import ReviewsList from './ReviewsList';
import DecisionButtons from './DecisionButtons';

export default function ValidateModal({ placeId, open, onClose, filteredList, updateDecisionInList }) {
  const [currentPlaceId, setCurrentPlaceId] = useState(placeId);
  const [place, setPlace] = useState(null);
  const [images, setImages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState(null);

  useEffect(() => {
    if (open && placeId) {
      setCurrentPlaceId(placeId);
    }
  }, [open, placeId]);

  useEffect(() => {
    if (open && currentPlaceId) {
      fetchPlaceData(currentPlaceId);
    }
    // eslint-disable-next-line
  }, [open, currentPlaceId]);

  const fetchPlaceData = async (id) => {
    setLoading(true);
    try {
      const [placeResult, imagesResult, reviewsResult, decisionResult] = await Promise.all([
        supabase
          .from('places')
          .select('place_id,title,address,city,state,country_code,lat,lng,category_name,categories,total_score,reviews_count,images_count,url,raw,created_at,updated_at')
          .eq('place_id', id)
          .single(),
        supabase
          .from('place_images')
          .select('image_url,author_name,author_url,uploaded_at,position,category')
          .eq('place_id', id)
          .order('position', { ascending: true })
          .limit(20),
        supabase
          .from('place_reviews')
          .select('stars,text,text_translated,published_at,reviewer_name,reviewer_id,reviewer_url,likes_count,is_local_guide,review_url')
          .eq('place_id', id)
          .order('likes_count', { ascending: false })
          .order('published_at', { ascending: false })
          .limit(10),
        supabase
          .from('decisions')
          .select('decision')
          .eq('place_id', id)
          .maybeSingle()
      ]);

      if (placeResult.error) return setLoading(false);

      setPlace(placeResult.data);
      setImages(imagesResult.data || []);
      setReviews(reviewsResult.data || []);
      setDecision(decisionResult.data?.decision || null);
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (newDecision) => {
    try {
      // Save decision to Supabase
      const { error } = await supabase
        .from('decisions')
        .upsert({
          place_id: currentPlaceId,
          decision: newDecision,
          decided_at: new Date().toISOString(),
        }, { onConflict: 'place_id' })
        .select();

      if (!error) {
        setDecision(newDecision);
        // Update localStorage
        const saved = localStorage.getItem('motel_decisions');
        const decisions = saved ? JSON.parse(saved) : {};
        decisions[currentPlaceId] = newDecision;
        localStorage.setItem('motel_decisions', JSON.stringify(decisions));
        // Update parent list state for this row only
        if (updateDecisionInList) updateDecisionInList(currentPlaceId, newDecision);

        // Move to next in filteredList
        if (filteredList && filteredList.length > 0) {
          const idx = filteredList.findIndex(id => id === currentPlaceId);
          if (idx !== -1 && idx < filteredList.length - 1) {
            setCurrentPlaceId(filteredList[idx + 1]);
          } else {
            onClose();
          }
        } else {
          onClose();
        }
      }
    } catch (e) {
      // handle error
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto p-6 relative" onClick={e => e.stopPropagation()}>
        <button className="absolute top-4 right-4 text-2xl" onClick={onClose}>✕</button>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Loading...</span>
          </div>
        ) : !place ? (
          <div className="text-center py-12">Place not found</div>
        ) : (
          <>
            <PlaceHeader place={place} decision={decision} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-1">
              <ImageGallery images={images} placeTitle={place.title} />
              <ReviewsList reviews={reviews} />
            </div>
            <DecisionButtons
              decision={decision}
              onDecision={handleDecision}
              onPrevious={null}
            />
          </>
        )}
      </div>
    </div>
  );
}
