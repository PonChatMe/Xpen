import React, { useRef, useEffect, useState, useCallback } from 'react';

export default function InfiniteScrollSelect({
  items,
  onLoadMore,
  isLoading,
  onSelect,
  selectedValue,
  renderItem,
  placeholder,
  className = '',
  itemClassName = '',
  containerHeight = '200px', // Default height for the scrollable container
}) {
  const scrollRef = useRef(null);
  const [showTopBlur, setShowTopBlur] = useState(false);
  const [showBottomBlur, setShowBottomBlur] = useState(false);

  const handleScroll = useCallback(() => {
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

    // Update blur visibility
    setShowTopBlur(scrollTop > 0);
    setShowBottomBlur(scrollTop + clientHeight < scrollHeight);

    // Infinite scroll logic
    if (scrollHeight - scrollTop - clientHeight < 50 && !isLoading && onLoadMore) {
      onLoadMore();
    }
  }, [isLoading, onLoadMore]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      // Initial check for blur
      handleScroll();
    }
    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  // Re-check blur when items change (e.g., more items loaded)
  useEffect(() => {
    if (scrollRef.current) {
      handleScroll();
    }
  }, [items, handleScroll]);

  return (
    <div className={`relative ${className}`}>
      {showTopBlur && (
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-900 to-transparent z-10 pointer-events-none" />
      )}
      <div
        ref={scrollRef}
        className="overflow-y-auto scrollbar-hide"
        style={{ maxHeight: containerHeight }}
      >
        {items.length === 0 && !isLoading ? (
          <div className="p-2 text-gray-400">{placeholder || 'No items to display'}</div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id || item.value || index} // Use a unique key
              onClick={() => onSelect(item.value || item.label || item)}
              className={`p-2 cursor-pointer hover:bg-gray-700 ${itemClassName} ${(selectedValue === (item.value || item.label || item)) ? 'bg-indigo-600 text-white' : 'text-white'}`}
            >
              {renderItem ? renderItem(item) : (item.label || item.value || item)}
            </div>
          ))
        )}
        {isLoading && (
          <div className="p-2 text-gray-400">Loading more...</div>
        )}
      </div>
      {showBottomBlur && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900 to-transparent z-10 pointer-events-none" />
      )}
    </div>
  );
}
