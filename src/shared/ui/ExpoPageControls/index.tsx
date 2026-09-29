'use client';

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const ExpoPageControls = ({ page, totalPages, onPageChange }: Props) => {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="박람회 페이지"
      className="flex items-center justify-center gap-20"
    >
      <button
        type="button"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
      >
        이전
      </button>
      <span aria-live="polite">
        {page + 1} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page + 1 >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        다음
      </button>
    </nav>
  );
};

export default ExpoPageControls;
