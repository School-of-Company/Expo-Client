import {
  RealtimeSummary,
  useRealtimeSummary,
} from '@/shared/libs/realtime/AdminRealtimeProvider';

const REALTIME_LABEL: Record<Exclude<RealtimeSummary, 'live'>, string> = {
  connecting: '실시간 연결 중',
  fallback: '실시간 연결 끊김',
  denied: '실시간 갱신 권한 없음',
};

/**
 * 갱신 방식 문구. SSE 를 쓰는 화면에서 연결돼 있으면 실시간, 아니면 기존 자동 갱신 주기를 함께 보여 준다.
 * 연결이 끊겨도 값은 마지막 조회 결과 그대로라 0 으로 바뀌지 않는다
 */
const RealtimeIntervalLabel = ({ intervalMs }: { intervalMs: number }) => {
  const realtime = useRealtimeSummary();
  const interval = `${intervalMs / 1000}초마다 자동 갱신`;

  if (realtime === 'live') return <>실시간 갱신 중</>;
  if (!realtime) return <>{interval}</>;
  return (
    <span className={realtime === 'connecting' ? undefined : 'text-error'}>
      {`${REALTIME_LABEL[realtime]} · ${interval}`}
    </span>
  );
};

export default RealtimeIntervalLabel;
