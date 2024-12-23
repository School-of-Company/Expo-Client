'use client';

import React, { useState, useEffect } from 'react';

export default function Loading() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => {
        if (prevDots.length >= 3) {
          return '';
        }
        return prevDots + '.';
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <p className="text-h1 text-main-600">
        로딩중{dots}
        <span className="invisible">...</span>
      </p>
    </div>
  );
}
