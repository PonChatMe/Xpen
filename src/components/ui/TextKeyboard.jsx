import React from 'react';
import { Button } from './button';

export default function TextKeyboard({ onKeyPress, onBackspace, onCancel }) {
  const letterButtons = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={onCancel}>
      <div className="bg-gray-900 w-full max-w-md rounded-t-2xl p-4 pb-8" onClick={(e) => e.stopPropagation()}>
        {/* Keyboard Layout */}
        <div className="space-y-2">
          {letterButtons.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-2 justify-center">
              {row.map((key) => (
                <Button
                  key={key}
                  onClick={() => onKeyPress(key)}
                  className="flex-1 h-12 text-xl font-semibold bg-gray-800 hover:bg-gray-700 text-white border-0"
                >
                  {key}
                </Button>
              ))}
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={onBackspace}
              className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white"
            >
              Backspace
            </Button>
            <Button
              onClick={onCancel}
              className="flex-1 h-12 bg-gray-600 hover:bg-gray-700 text-white"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
