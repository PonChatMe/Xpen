import React from 'react';
import { BsTwitterX } from 'react-icons/bs';

export default function Lower() {
  return (
    <div className="text-center mt-8">
      <p className="text-gray-500">
        Have any feedback or questions? Contact the developer on{' '}
        <a
          href="https://x.com/Ponchatme"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline inline-flex items-center gap-1"
        >
          <BsTwitterX />
        </a>
        .
      </p>
    </div>
  );
}