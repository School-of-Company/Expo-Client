import { ProgramScanResult } from '../../model/programScanResult';

const BORDER = {
  success: 'border-main-600',
  error: 'border-error',
  neutral: 'border-gray-300',
} as const;

const TITLE_COLOR = {
  success: 'text-main-600',
  error: 'text-error',
  neutral: 'text-gray-600',
} as const;

/** 마지막 프로그램 스캔 결과를 크게 보여 준다. 결과가 없으면 대기 상태를 보여 준다 */
const ProgramScanResultCard = ({
  result,
  isProcessing,
}: {
  result: ProgramScanResult | null;
  isProcessing: boolean;
}) => {
  if (isProcessing) {
    return (
      <div
        role="status"
        className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-sm border-1 border-solid border-main-300 bg-main-100 px-20 py-24"
      >
        <p className="text-h2b text-main-600">처리 중...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div
        role="status"
        className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-sm bg-gray-100 px-20 py-24"
      >
        <p className="text-h2b text-gray-400">스캔 대기</p>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex h-full min-h-[200px] flex-col items-center justify-center gap-10 rounded-sm border-2 border-solid px-20 py-24 text-center ${BORDER[result.status]}`}
    >
      <p className={`text-h1m ${TITLE_COLOR[result.status]}`}>{result.title}</p>
      {result.detail && (
        <p className="break-keep text-body1r text-gray-700">{result.detail}</p>
      )}
      <p className="text-caption1r text-gray-500">{result.at}</p>
    </div>
  );
};

export default ProgramScanResultCard;
