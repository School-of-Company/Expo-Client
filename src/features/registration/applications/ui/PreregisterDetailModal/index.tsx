'use client';

import { useEffect } from 'react';
import { XMark } from '@/shared/assets/icons';
import { Button, Loading } from '@/shared/ui';
import { formatDateTime, SectionError } from '../../../common';
import { PreregisterMember } from '../../../common/api/preregisterLedgerApi';
import {
  LEDGER_STATUS_LABEL,
  LEDGER_STATUS_STYLE,
  OCCUPATION_LABEL,
} from '../../../common/model/ledger';
import {
  getPreregisterErrorMessage,
  isCancellablePreregister,
  useCancelPreregistration,
  usePreregisterDetail,
} from '../../../common/model/preregisterLedger';

interface PreregisterDetailModalProps {
  expoId: string;
  reservationId: string;
  sessionLabel: (sessionId: number) => string;
  onClose: () => void;
}

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex gap-16">
    <dt className="w-[96px] flex-none text-body2r text-gray-500">{label}</dt>
    <dd className="min-w-0 text-body2r text-black">{value}</dd>
  </div>
);

const MemberCard = ({
  title,
  member,
}: {
  title: string;
  member: PreregisterMember;
}) => (
  <dl className="space-y-8 rounded-sm border-1 border-solid border-gray-200 p-16">
    <Field label="구분" value={title} />
    <Field label="이름" value={member.name} />
    <Field
      label="직업"
      value={member.occupation ? OCCUPATION_LABEL[member.occupation] : '-'}
    />
    <Field label="개인 번호" value={member.phoneNumber ?? '없음'} />
    <Field
      label="대표 수신 번호"
      value={member.notificationPhoneNumber ?? '없음'}
    />
  </dl>
);

/** 사전등록 일행 한 건을 다시 조회해 최신 상태와 이력을 보여 주고 취소한다 */
const PreregisterDetailModal = ({
  expoId,
  reservationId,
  sessionLabel,
  onClose,
}: PreregisterDetailModalProps) => {
  const { data, error, isLoading, isError, refetch } = usePreregisterDetail(
    expoId,
    reservationId,
  );
  const cancellation = useCancelPreregistration(expoId);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const history = [...(data?.history ?? [])].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );

  const handleCancel = () => {
    if (!data) return;
    // 확정 취소는 빈 자리로 대기 일행이 자동 승급된다
    const promotion =
      data.status === 'CONFIRMED'
        ? ' 대기 일행이 있으면 자동으로 확정됩니다.'
        : '';
    if (
      !window.confirm(
        `${data.representative.name}님 일행(${data.applicants}명) 전체의 사전등록을 취소할까요?${promotion} 취소한 신청은 되돌릴 수 없습니다.`,
      )
    )
      return;
    cancellation.mutate(data.reservationId);
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-40">
          <Loading />
        </div>
      );
    }
    if (isError || !data) {
      return (
        <SectionError
          message={getPreregisterErrorMessage(
            error,
            '사전등록 상세를 불러오지 못했습니다.',
          )}
          onRetry={() => refetch()}
        />
      );
    }
    return (
      <>
        <section className="space-y-[10px]">
          <p className="text-h3b text-black">신청</p>
          <dl className="space-y-8">
            <Field label="회차" value={sessionLabel(data.sessionId)} />
            <Field
              label="상태"
              value={
                <span className={LEDGER_STATUS_STYLE[data.status]}>
                  {LEDGER_STATUS_LABEL[data.status]}
                  {data.status === 'WAITING' &&
                    data.waitingPosition !== null &&
                    ` (${data.waitingPosition}번째)`}
                </span>
              }
            />
            <Field label="일행 인원" value={`${data.applicants}명`} />
            <Field label="신청일시" value={formatDateTime(data.createdAt)} />
            <Field
              label="신청 ID"
              value={<span className="break-all">{data.reservationId}</span>}
            />
          </dl>
        </section>

        <section className="space-y-[10px]">
          <p className="text-h3b text-black">대표자·동행자</p>
          <MemberCard title="대표자" member={data.representative} />
          {data.companions.map((member, index) => (
            <MemberCard
              key={member.participantId ?? `companion-${index}`}
              title={`동행자 ${index + 1}`}
              member={member}
            />
          ))}
        </section>

        <section className="space-y-[10px]">
          <p className="text-h3b text-black">상태 변경 이력</p>
          {history.length === 0 ? (
            <p className="text-body2r text-gray-400">이력이 없습니다.</p>
          ) : (
            <ol className="space-y-8">
              {history.map((item) => (
                <li key={item.id} className="flex gap-16 text-body2r">
                  <span className="w-[120px] flex-none text-gray-500">
                    {formatDateTime(item.createdAt)}
                  </span>
                  <span className={LEDGER_STATUS_STYLE[item.status]}>
                    {LEDGER_STATUS_LABEL[item.status]}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        {isCancellablePreregister(data.status) && (
          <section className="space-y-[10px]">
            <p className="text-caption1r text-gray-400">
              취소는 일행 전체에 적용됩니다. 이미 입장했거나 취소 기간이
              끝났으면 서버가 취소를 거절합니다.
            </p>
            <Button
              variant="white"
              disabled={cancellation.isPending}
              onClick={handleCancel}
            >
              {cancellation.isPending ? '취소하는 중...' : '신청 취소'}
            </Button>
          </section>
        )}
      </>
    );
  };

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center px-[18px]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="preregister-detail-title"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-[640px] flex-col gap-[32px] overflow-y-auto rounded-sm bg-white px-[40px] py-[36px] mobile:px-20"
      >
        <div className="flex items-center">
          <p
            id="preregister-detail-title"
            className="flex-grow text-center text-h2r text-black mobile:text-body1r"
          >
            사전등록 상세
          </p>
          <button type="button" onClick={onClose} aria-label="닫기">
            <XMark />
          </button>
        </div>
        {renderBody()}
      </div>
    </div>
  );
};

export default PreregisterDetailModal;
