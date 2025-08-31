import React, { useState, useEffect, useRef } from 'react';
import { Button } from './button';
import TextKeyboard from './TextKeyboard';

export default function NumericKeypad({ onConfirm, onCancel, initialValue = '', description, setDescription }) {
  const [displayValue, setDisplayValue] = useState(initialValue);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showTextKeyboard, setShowTextKeyboard] = useState(false);
  const keypadRef = useRef(null);

  const handleNumberClick = (number) => {
    if (displayValue.length < 10) { // Limit to 10 digits
      setDisplayValue(displayValue + number);
    }
  };

  const handleDecimalClick = () => {
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  const handleBackspace = () => {
    setDisplayValue(displayValue.slice(0, -1));
  };

  const handleClear = () => {
    setDisplayValue('');
  };

  const handleConfirm = () => {
    if (displayValue && parseFloat(displayValue) > 0) {
      setIsConfirming(true);
      onConfirm(parseFloat(displayValue));
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  const numberButtons = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['.', '0', '⌫']
  ];

  const handleTextKeyPress = (key) => {
    setDescription(prev => prev + key);
  };

  const handleTextBackspace = () => {
    setDescription(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (showTextKeyboard) return; // Don't interfere if text keyboard is open

      if (event.key >= '0' && event.key <= '9') {
        handleNumberClick(event.key);
      } else if (event.key === '.') {
        handleDecimalClick();
      } else if (event.key === 'Backspace') {
        handleBackspace();
      } else if (event.key === 'Enter') {
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [displayValue, showTextKeyboard]); // Re-run effect if displayValue or showTextKeyboard changes

  return (
    <div ref={keypadRef} className="fixed inset-0 bg-black/90 flex items-end justify-center z-50" onClick={onCancel}>
      <div className="bg-gray-900 w-full max-w-md rounded-t-2xl p-4 pb-8" onClick={(e) => e.stopPropagation()}>
        {/* Combined Display, File Upload, and Description */}
        <div className="mb-4 flex gap-4 items-center">
          

          {/* Description Input */}
          <div className="w-[50%] h-16 flex items-center">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full h-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none text-base"
            />
          </div>

          {/* Display Value */}
          <div className="w-[40%] p-2 bg-gray-800 rounded-lg text-right h-16 flex flex-col justify-center">
            <div className="text-xl font-mono text-white">
              {displayValue || '0'}
            </div>
            <div className="text-xs text-gray-400">
              {displayValue ? `฿${parseFloat(displayValue || 0).toLocaleString()}` : '฿0'}
            </div>
          </div>
        </div>

        {/* Keypad */}
        <div className="space-y-2">
          {numberButtons.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
              {row.map((key) => (
                <Button
                  key={key}
                  onClick={() => {
                    if (key === '⌫') {
                      handleBackspace();
                    } else if (key === '.') {
                      handleDecimalClick();
                    } else {
                      handleNumberClick(key);
                    }
                  }}
                  className="flex-1 h-14 text-xl font-semibold bg-gray-800 hover:bg-gray-700 text-white border-0"
                >
                  {key}
                </Button>
              ))}
            </div>
          ))}
          
          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleClear}
              className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white"
            >
              Clear
            </Button>
            <Button
              onClick={handleCancel}
              className="flex-1 h-12 bg-gray-600 hover:bg-gray-700 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!displayValue || parseFloat(displayValue) <= 0}
              className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
      {showTextKeyboard && (
        <TextKeyboard
          onKeyPress={handleTextKeyPress}
          onBackspace={handleTextBackspace}
          onCancel={() => setShowTextKeyboard(false)}
        />
      )}
    </div>
  );
}
