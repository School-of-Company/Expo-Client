interface RefreshStatusProps {
  /** 마지막으로 성공한 조회 시각(ms). 아직 성공한 적이 없으면 0 */
  updatedAt: number;
  isFetching: boolean;
  onRefresh: () => void;
  /** 자동 갱신 주기(ms) */
  intervalMs: number;
  /** 마지막 갱신에서 실패한 영역이 있으면 이전 값을 보여 주는 중임을 알린다 */
  hasError?: boolean;
}

const formatTime = (ms: number) =>
  new Date(ms).toLocaleTimeString('ko-KR', { hour12: false });

/** 마지막 성공 시각과 자동 갱신 주기를 보여 주고 수동으로 다시 조회한다 */
const RefreshStatus = ({
  updatedAt,
  isFetching,
  onRefresh,
  intervalMs,
  hasError = false,
}: RefreshStatusProps) => (
  <div className="flex items-center gap-12 text-caption1r text-gray-400">
    <p aria-live="polite">
      {updatedAt > 0 ? `마지막 갱신 ${formatTime(updatedAt)}` : '갱신 전'}
      {` · ${intervalMs / 1000}초마다 자동 갱신`}
    </p>
    {hasError && (
      <p role="status" className="text-error">
        일부 영역 갱신 실패 · 이전 값 표시 중
      </p>
    )}
    <button
      type="button"
      onClick={onRefresh}
      disabled={isFetching}
      className="text-main-600 underline disabled:text-gray-300 disabled:no-underline"
    >
      {isFetching ? '갱신 중...' : '새로고침'}
    </button>
  </div>
);

export default RefreshStatus;
