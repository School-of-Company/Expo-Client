interface LoadMoreButtonProps {
  isLoading: boolean;
  onClick: () => void;
}

/** 이력 표 아래에서 다음 페이지를 이어 붙인다 */
const LoadMoreButton = ({ isLoading, onClick }: LoadMoreButtonProps) => (
  <div className="flex justify-center">
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="px-8 py-12 text-body2r text-main-600 underline disabled:text-gray-400"
    >
      {isLoading ? '불러오는 중…' : '더 보기'}
    </button>
  </div>
);

export default LoadMoreButton;
