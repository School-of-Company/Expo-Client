import { formatDefinitionSchedule } from '@/features/registration/common/model/ledger';
import { MyPreRegisterWaitlist } from '../../api/myApplications';
import { usePreRegisterSessions } from '../../model/usePreRegister';

const STATUS_LABEL: Record<MyPreRegisterWaitlist['status'], string> = {
  WAITING: '대기',
  PROCESSING: '확정 처리 중',
  PROMOTION_ENDED: '승급 종료',
};

const STATUS_GUIDE: Record<MyPreRegisterWaitlist['status'], string> = {
  WAITING:
    '대기는 일행 단위 선착순입니다. 앞 일행 전체가 들어갈 자리가 생겨야 승급되므로, 빈자리가 보여도 바로 확정되지 않을 수 있습니다. 확정되면 QR이 대표자 번호로 발송됩니다.',
  PROCESSING:
    '자리가 나서 확정 처리 중입니다. 잠시 후 새로고침하면 신청 현황에 확정으로 표시됩니다.',
  PROMOTION_ENDED: '회차가 시작되어 더 이상 대기에서 확정으로 바뀌지 않습니다.',
};

/**
 * 사전등록 대기 일행. 대기 중에는 QR·연수 신청이 없고, 취소는 일행 전체만 할 수 있다.
 * 승급 처리 중(PROCESSING)에는 서버가 취소를 막으므로 버튼을 숨긴다.
 */
const PreRegisterWaitlist = ({
  expoId,
  waitlist,
  onCancel,
  isCancelling,
}: {
  expoId: string;
  waitlist: MyPreRegisterWaitlist;
  onCancel: () => void;
  isCancelling: boolean;
}) => {
  const { sessionId, applicants, status, position } = waitlist;
  // 회차 선택 화면과 같은 캐시. 목록을 못 받으면 회차 번호로 둔다
  const { data: sessions } = usePreRegisterSessions(expoId);
  const session = sessions?.find(({ id }) => id === sessionId);

  return (
    <div className="flex items-center justify-between gap-12 rounded-sm border-1 border-solid border-gray-200 bg-white px-18 py-18 mobile:flex-col mobile:items-stretch">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-8">
          <p className="min-w-0 break-keep text-body2b text-black">
            사전등록 대기 ·{' '}
            {session
              ? `${session.title} (${formatDefinitionSchedule(session.startedAt, session.endedAt)})`
              : `회차 ${sessionId}`}
          </p>
          <p className="text-body2r text-gray-500">
            대표자 포함 {applicants.toLocaleString()}명
          </p>
          <p className="text-caption1b text-main-600">
            {STATUS_LABEL[status] ?? status}
            {status === 'WAITING' && position !== null && ` · ${position}번째`}
          </p>
        </div>
        <p className="break-keep text-caption1r text-gray-500">
          {STATUS_GUIDE[status]}
        </p>
      </div>

      {status !== 'PROCESSING' && (
        <button
          type="button"
          disabled={isCancelling}
          onClick={onCancel}
          className="whitespace-nowrap rounded-sm border-1 border-solid border-error px-16 py-8 text-caption1b text-error disabled:opacity-50"
        >
          일행 전체 대기 취소
        </button>
      )}
    </div>
  );
};

export default PreRegisterWaitlist;
