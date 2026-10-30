'use client';

import { toast } from 'react-toastify';
import { printBadgeInFrame } from '../../model/printBadgeInFrame';
import {
  PrintedBadge,
  StationState,
  useBadgePrintStation,
} from '../../model/useBadgePrintStation';

const STATE_TEXT: Record<StationState, string> = {
  connecting: '연결 중',
  running: '자동 출력 중',
  'taken-over': '다른 곳에서 이 출력대를 열었습니다',
  'not-found': '출력대를 찾지 못했습니다',
  error: '연결 오류(자동으로 다시 연결합니다)',
};

const RESULT_TEXT: Record<PrintedBadge['result'], string> = {
  ok: '출력 요청',
  retry: '출력 실패 · 다시 시도',
  check: '확인 필요',
};

/** 출력대 한 대의 자동 출력 화면. 명찰을 받아 기본 프린터로 바로 인쇄한다 */
const BadgePrintStationPanel = ({
  expoId,
  stationId,
}: {
  expoId: string;
  stationId: string;
}) => {
  const {
    state,
    label,
    paused,
    current,
    recent,
    lastError,
    reopen,
    togglePaused,
  } = useBadgePrintStation(expoId, stationId);

  const running = state === 'running';

  const handleTestPrint = async () => {
    try {
      await printBadgeInFrame({ name: '홍길동', school: '테스트 출력' });
    } catch {
      toast.error('테스트 출력을 하지 못했습니다.');
    }
  };

  return (
    <section className="flex flex-col gap-16 rounded-sm border-1 border-solid border-gray-200 p-24 mobile:p-16">
      <div
        role="status"
        className={`flex flex-wrap items-center justify-between gap-12 rounded-sm px-24 py-20 ${
          running && !paused ? 'bg-main-100' : 'bg-gray-100'
        }`}
      >
        <div className="flex flex-col gap-4">
          <p className="text-h2b text-black">{label || '출력대'}</p>
          <p
            className={`text-body2b ${
              running && !paused ? 'text-main-600' : 'text-error'
            }`}
          >
            {running && paused ? '일시정지' : STATE_TEXT[state]}
          </p>
        </div>
        <div className="flex flex-wrap gap-8">
          <button
            type="button"
            onClick={() => void handleTestPrint()}
            className="rounded-sm border-1 border-solid border-gray-200 bg-white px-16 py-8 text-caption1b text-gray-700"
          >
            테스트 출력
          </button>
          {running && (
            <button
              type="button"
              onClick={() => void togglePaused()}
              className="rounded-sm border-1 border-solid border-gray-200 bg-white px-16 py-8 text-caption1b text-gray-700"
            >
              {paused ? '출력 다시 시작' : '일시정지(용지 교체)'}
            </button>
          )}
          {state === 'taken-over' && (
            <button
              type="button"
              onClick={reopen}
              className="rounded-sm bg-main-600 px-16 py-8 text-caption1b text-white"
            >
              여기서 다시 열기
            </button>
          )}
        </div>
      </div>

      {state === 'taken-over' && (
        <p className="break-keep text-body2r text-gray-600">
          같은 출력대를 다른 탭이나 노트북에서 열어 이 화면은 출력을 멈췄습니다.
          이 노트북에서 출력하려면 &quot;여기서 다시 열기&quot;를 누르세요.
        </p>
      )}
      {lastError && <p className="text-caption1r text-error">{lastError}</p>}

      <div className="flex flex-col gap-8">
        <p className="text-body1b text-black">
          {current ? `출력 중: ${current.name}` : '최근 출력'}
        </p>
        {recent.length === 0 ? (
          <p className="rounded-sm bg-gray-100 px-16 py-16 text-center text-body2r text-gray-500">
            아직 출력한 명찰이 없습니다.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {recent.map((item) => (
              <li
                key={`${item.jobId}-${item.at}`}
                className="flex items-center justify-between gap-12 rounded-sm bg-gray-100 px-16 py-12"
              >
                <p className="text-h3b text-black">
                  {item.name}
                  {item.school && (
                    <span className="ml-8 text-body2r text-gray-600">
                      {item.school}
                    </span>
                  )}
                </p>
                <p
                  className={`whitespace-nowrap text-caption1b ${
                    item.result === 'ok' ? 'text-gray-600' : 'text-error'
                  }`}
                >
                  {RESULT_TEXT[item.result]} · {item.at}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default BadgePrintStationPanel;
