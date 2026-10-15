interface SectionErrorProps {
  message: string;
  onRetry: () => void;
}

/** 한 영역의 조회만 실패했을 때 그 자리에만 표시한다. 다른 영역은 그대로 보인다 */
const SectionError = ({ message, onRetry }: SectionErrorProps) => (
  <div
    role="alert"
    className="flex items-center justify-between gap-16 rounded-sm border-1 border-solid border-gray-200 px-20 py-16"
  >
    <p className="text-body2r text-gray-500">{message}</p>
    <button
      type="button"
      onClick={onRetry}
      className="shrink-0 text-body2r text-main-600 underline"
    >
      다시 시도
    </button>
  </div>
);

export default SectionError;
