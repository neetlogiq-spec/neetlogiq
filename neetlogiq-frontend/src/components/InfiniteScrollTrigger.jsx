import React, { useEffect, useRef, useCallback } from 'react';

const InfiniteScrollTrigger = ({ 
  onLoadMore, 
  hasMore = true, 
  isLoading = false,
  threshold = 0.8,
  rootMargin = '100px',
  children = null
}) => {
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  const handleIntersection = useCallback((entries) => {
    const [entry] = entries;
    
    if (entry.isIntersecting && hasMore && !isLoading) {
      console.log('🔄 Intersection Observer triggered - loading more content');
      // Add a small delay to make the loading feel more natural
      setTimeout(() => {
        onLoadMore();
      }, 100);
    }
  }, [hasMore, isLoading, onLoadMore]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    // Create intersection observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null, // Use viewport as root
      rootMargin: rootMargin, // Start loading 100px before the element is visible
      threshold: threshold, // Trigger when 80% of the element is visible
    });

    // Start observing the sentinel element
    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, rootMargin, threshold]);

  // Don't render sentinel if no more content
  if (!hasMore) {
    return children || null;
  }

  return (
    <>
      {children}
      {/* Sentinel element that triggers loading when it comes into view */}
      <div 
        ref={sentinelRef} 
        style={{ 
          height: '1px', 
          width: '100%',
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />
    </>
  );
};

export default InfiniteScrollTrigger;
