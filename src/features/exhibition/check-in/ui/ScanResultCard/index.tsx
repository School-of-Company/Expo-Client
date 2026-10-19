import { ScanResult } from '../../model/scanResult';
import { ScanMode } from '../ScanModeToggle';

/** 마지막 스캔 결과를 크게 보여 준다. 결과가 없으면 지금 모드의 대기 상태를 보여 준다 */
const ScanResultCard = ({
  mode,
  result,
  isProcessing,
}: {
  mode: ScanMode;
  result: ScanResult | null;
  isProcessing: boolean;
}) => {
  const modeLabel = mode === 'entry' ? '입장' : '퇴장';

  if (isProcessing) {
    return (
      <div
        role="status"
        className="flex h-full min-h-[240px] flex-col items-center justify-center gap-8 rounded-sm border-1 border-solid border-main-300 bg-main-100 px-20 py-24"
      >
        <p className="text-h2b text-main-600">{modeLabel} 처리 중...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div
        role="status"
        className="flex h-full min-h-[240px] flex-col items-center justify-center gap-8 rounded-sm bg-gray-100 px-20 py-24"
      >
        <p className="text-h2b text-gray-400">{modeLabel} 스캔 대기</p>
      </div>
    );
  }

  const isSuccess = result.status === 'success';
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex h-full min-h-[240px] flex-col items-center justify-center gap-10 rounded-sm border-2 border-solid px-20 py-24 text-center ${
        isSuccess ? 'border-main-600' : 'border-error'
      } ${result.isReEntry ? 'bg-main-100' : ''}`}
    >
      <p className={`text-h1m ${isSuccess ? 'text-main-600' : 'text-error'}`}>
        {result.title}
      </p>
      {result.detail && (
        <p className="break-keep text-body1r text-gray-700">{result.detail}</p>
      )}
      <p className="text-caption1r text-gray-500">{result.at}</p>
    </div>
  );
};

export default ScanResultCard;
