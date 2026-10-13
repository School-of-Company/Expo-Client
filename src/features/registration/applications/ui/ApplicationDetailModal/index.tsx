'use client';

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { XMark } from '@/shared/assets/icons';
import { Button, Loading } from '@/shared/ui';
import { formatDateTime, SectionError } from '../../../common';
import {
  formatDefinitionSchedule,
  LEDGER_STATUS_LABEL,
  LEDGER_STATUS_STYLE,
  OCCUPATION_LABEL,
  PROGRAM_TYPE_LABEL,
  toLedgerRow,
  useApplicationDetail,
  useCancelApplication,
} from '../../../common/model/ledger';

interface ApplicationDetailModalProps {
  expoId: string;
  applicationId: string;
  onClose: () => void;
}

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex gap-16">
    <dt className="w-[96px] flex-none text-body2r text-gray-500">{label}</dt>
    <dd className="min-w-0 text-body2r text-black">{value}</dd>
  </div>
);

/** 신청 한 건을 원장에서 다시 조회해 최신 상태와 상태 변경 이력을 보여 준다 */
const ApplicationDetailModal = ({
  expoId,
  applicationId,
  onClose,
}: ApplicationDetailModalProps) => {
  const { data, isLoading, isError, refetch } = useApplicationDetail(
    expoId,
    applicationId,
  );

  const cancel = useCancelApplication(expoId);

  const handleCancel = () => {
    if (cancel.isPending) return;
    if (
      !window.confirm(
        '이 신청을 취소할까요? 취소 후에는 되돌릴 수 없으며, 대기자 승급은 서버 정책에 따라 처리됩니다.',
      )
    )
      return;
    cancel.mutate(applicationId, {
      onSuccess: ({ status }) =>
        toast.success(
          `처리 결과: ${LEDGER_STATUS_LABEL[status as keyof typeof LEDGER_STATUS_LABEL] ?? status}`,
        ),
    });
  };

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

  const row = data ? toLedgerRow(data) : null;
  // 이력은 오래된 순으로 보여 준다
  const history = data
    ? [...data.history].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    : [];

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-40">
          <Loading />
        </div>
      );
    }
    if (isError) {
      return (
        <SectionError
          message="신청 상세를 불러오지 못했습니다."
          onRetry={() => refetch()}
        />
      );
    }
    if (!row) {
      return (
        <p className="py-40 text-center text-body2r text-gray-400">
          신청을 찾을 수 없습니다. 원장에서 삭제되었거나 다른 행사의 신청입니다.
        </p>
      );
    }
    return (
      <>
        <section className="space-y-[10px]">
          <p className="text-h3b text-black">참가자</p>
          <dl className="space-y-8">
            {row.isParticipantMissing ? (
              <Field label="이름" value="참가자 정보 없음" />
            ) : (
              <>
                <Field label="이름" value={row.name} />
                <Field
                  label="구분"
                  value={row.isRepresentative ? '대표자' : '동행자'}
                />
                <Field
                  label="직업"
                  value={
                    row.occupation ? OCCUPATION_LABEL[row.occupation] : '-'
                  }
                />
                {/* 연수 연결은 직업과 섞지 않고 따로 표시한다 */}
                <Field
                  label="연수 연결"
                  value={
                    row.linkedTraineeId !== null
                      ? `연결됨 (연수자 ${row.linkedTraineeId})`
                      : '없음'
                  }
                />
              </>
            )}
            <Field label="개인 번호" value={row.phoneNumber ?? '없음'} />
            <Field
              label="대표 수신 번호"
              value={row.notificationPhoneNumber ?? '없음'}
            />
          </dl>
        </section>

        <section className="space-y-[10px]">
          <p className="text-h3b text-black">신청</p>
          <dl className="space-y-8">
            <Field
              label="회차"
              value={`[${PROGRAM_TYPE_LABEL[row.programType]}] ${row.title}`}
            />
            <Field
              label="일시"
              value={formatDefinitionSchedule(row.startedAt, row.endedAt)}
            />
            <Field
              label="상태"
              value={
                <span className={LEDGER_STATUS_STYLE[row.status]}>
                  {LEDGER_STATUS_LABEL[row.status]}
                </span>
              }
            />
            <Field label="신청일시" value={formatDateTime(row.createdAt)} />
            <Field
              label="신청 ID"
              value={<span className="break-all">{row.id}</span>}
            />
          </dl>
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

        {row.status !== 'CANCELLED' && (
          <section className="space-y-8">
            {cancel.error && (
              <p role="alert" className="text-body2r text-error">
                {cancel.error instanceof Error
                  ? cancel.error.message
                  : '신청을 취소하지 못했습니다.'}
              </p>
            )}
            <Button
              variant="white"
              disabled={cancel.isPending}
              onClick={handleCancel}
            >
              {cancel.isPending ? '취소 처리 중...' : '신청 취소'}
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
        aria-labelledby="application-detail-title"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-[640px] flex-col gap-[32px] overflow-y-auto rounded-sm bg-white px-[40px] py-[36px] mobile:px-20"
      >
        <div className="flex items-center">
          <p
            id="application-detail-title"
            className="flex-grow text-center text-h2r text-black mobile:text-body1r"
          >
            신청 상세
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

export default ApplicationDetailModal;
