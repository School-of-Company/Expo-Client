'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight } from '@/shared/assets/icons';

const NavigationBar = ({ totalPage }: { totalPage: number }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  if (totalPage <= 1) return null;

  const maxPagesToShow = 5;

  const changePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`?${params.toString()}`);
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

  // 보이는 숫자 간격은 그대로 두고 각 버튼의 누르는 영역을 44px 로 넓힌다
  const hitArea = 'flex h-[44px] min-w-[44px] items-center justify-center';

  return (
    <nav aria-label="페이지 이동" className="flex items-center">
      <button
        type="button"
        onClick={handlePrev}
        disabled={currentPage === 1}
        aria-label="이전 페이지"
        className={hitArea}
      >
        <ArrowLeft size={24} />
      </button>
      {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
        const page = startPage + i;
        const isActive = currentPage === page;
        return (
          <button
            type="button"
            key={page}
            className={`${hitArea} text-body1r ${
              isActive ? 'text-main-600' : 'text-gray-400'
            }`}
            onClick={() => changePage(page)}
            aria-label={`${page}페이지`}
            aria-current={isActive ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}
      <button
        type="button"
        onClick={handleNext}
        disabled={currentPage === totalPage}
        aria-label="다음 페이지"
        className={hitArea}
      >
        <ArrowRight />
      </button>
    </nav>
  );
};

export default NavigationBar;
