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
        className="flex min-h-[160px] flex-col items-center justify-center gap-8 rounded-sm border-1 border-solid border-main-300 px-20 py-24"
      >
        <p className="text-h3b text-main-600">{modeLabel} 처리 중...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div
        role="status"
        className="flex min-h-[160px] flex-col items-center justify-center gap-8 rounded-sm border-1 border-dashed border-gray-300 px-20 py-24"
      >
        <p className="text-h3b text-gray-500">{modeLabel} 스캔 대기</p>
      </div>
    );
  }

  const isSuccess = result.status === 'success';
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex min-h-[160px] flex-col items-center justify-center gap-8 rounded-sm border-1 border-solid px-20 py-24 text-center ${
        isSuccess ? 'border-main-600' : 'border-error'
      }`}
    >
      <p className={`text-h3b ${isSuccess ? 'text-main-600' : 'text-error'}`}>
        {result.title}
      </p>
      {result.detail && (
        <p className="break-keep text-body2r text-gray-600">{result.detail}</p>
      )}
      <p className="text-caption1r text-gray-400">{result.at}</p>
    </div>
  );
};

export default ScanResultCard;
