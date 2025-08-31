import React from 'react';

export default function WarningModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm mx-auto text-center relative">
        <h2 className="text-xl font-bold text-yellow-400 mb-2">Guest Mode Warning</h2>
        <p className="text-gray-300 mb-6">You are in guest mode. Any data you enter will not be saved. Please sign up to save your progress.</p>
        <button
          onClick={onClose}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
