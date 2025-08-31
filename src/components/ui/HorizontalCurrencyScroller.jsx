import React, { useRef, useEffect } from 'react';
import { Button } from './button'; // Assuming you have a Button component

export default function HorizontalCurrencyScroller({
  currencies,
  selectedValue,
  onSelect,
  className = '',
}) {
  const scrollRef = useRef(null);

  // Optional: Scroll to selected item on initial load
  useEffect(() => {
    if (scrollRef.current && selectedValue) {
      const selectedElement = scrollRef.current.querySelector(`[data-value="${selectedValue}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }
    }
  }, [selectedValue]);

  return (
    <div
      ref={scrollRef}
      className={`flex overflow-x-auto scrollbar-hide space-x-2 p-1 ${className}`}
      style={{ WebkitOverflowScrolling: 'touch' }} // For smooth scrolling on iOS
    >
      {currencies.map((currency) => (
        <Button
          key={currency.value}
          data-value={currency.value}
          onClick={() => onSelect(currency.value)}
          variant={selectedValue === currency.value ? 'filled' : 'outline'}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
            ${selectedValue === currency.value
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
        >
          {currency.label}
        </Button>
      ))}
    </div>
  );
}
