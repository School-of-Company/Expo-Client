'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight } from '@/shared/assets/icons';

interface NavigationBarProps {
  id: string;
  totalPage: number;
}

const NavigationBar = ({ id, totalPage }: NavigationBarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  if (totalPage <= 1) return null;

  const maxPagesToShow = 5;

  const changePage = (page: number) => {
    router.push(`/expo-manage/${id}?page=${page}`);
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      changePage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPage) {
      changePage(currentPage + 1);
    }
  };

  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(totalPage, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  return (
    <div className="flex items-center gap-34">
      <button onClick={handlePrev} disabled={currentPage === 1}>
        <ArrowLeft size={24} />
      </button>
      {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
        const page = startPage + i;
        const isActive = currentPage === page;
        return (
          <button
            key={page}
            className={`text-body1ㅠ ${
              isActive ? 'text-main-600' : 'text-gray-400'
            }`}
            onClick={() => changePage(page)}
          >
            {page}
          </button>
        );
      })}
      <button onClick={handleNext} disabled={currentPage === totalPage}>
        <ArrowRight />
      </button>
    </div>
  );
};

export default NavigationBar;
