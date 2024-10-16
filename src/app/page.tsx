'use client';

import { toast } from 'react-toastify';
import Counter from '@/components/Counter';

export default function Home() {
  const handleClick = () => {
    toast.success('하이');
  };

  return (
    <main>
      <h1>Zustand Counter 테스트 하이</h1>
      <Counter />
      <button
        onClick={handleClick}
        className="rounded-sm bg-gray-600 px-4 py-3 text-h4 text-white"
      >
        tostify alarm 히히
      </button>
    </main>
  );
}
