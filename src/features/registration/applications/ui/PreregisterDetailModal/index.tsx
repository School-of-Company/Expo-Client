'use client';

import { useEffect } from 'react';
import { AnswerList } from '@/entities/form';
import { XMark } from '@/shared/assets/icons';
import { Loading } from '@/shared/ui';
import { formatDateTime, SectionError } from '../../../common';
import { OCCUPATION_LABEL } from '../../../common/model/ledger';
import {
  getPreregisterErrorMessage,
  PREREGISTER_STATUS_LABEL,
  toPreregisterRow,
  usePreregisterDetail,
} from '../../../common/model/preregisterLedger';

interface PreregisterDetailModalProps {
  expoId: string;
  rowKey: string;
  sessionLabel: (sessionId: number) => string;
  onClose: () => void;
}

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex gap-16">
    <dt className="w-[96px] flex-none text-body2r text-gray-500">{label}</dt>
    <dd className="min-w-0 text-body2r text-black">{value}</dd>
  </div>
);

/** 목록 행의 key 로 한 행을 다시 조회한다. 참가자 행은 User 현재 정보, 예약 행은 제출 당시 스냅샷을 보여 준다 */
const PreregisterDetailModal = ({
  expoId,
  rowKey,
  sessionLabel,
  onClose,
}: PreregisterDetailModalProps) => {
  const { data, error, isLoading, isError, refetch } = usePreregisterDetail(
    expoId,
    rowKey,
  );

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
    const row = toPreregisterRow(data);
    return (
      <>
        <section className="space-y-[10px]">
          <p className="text-h3b text-black">
            {row.isReservation ? '대기·처리중 일행 (대표자)' : '참가자'}
          </p>
          <dl className="space-y-8">
            <Field label="이름" value={row.name ?? '-'} />
            {!row.isReservation && (
              <Field
                label="구분"
                value={row.relation === 'REPRESENTATIVE' ? '대표자' : '동행자'}
              />
            )}
            {row.isReservation && (
              <Field label="일행 인원" value={`${row.applicants}명`} />
            )}
            <Field
              label="직업"
              value={row.occupation ? OCCUPATION_LABEL[row.occupation] : '-'}
            />
            <Field label="개인 번호" value={row.phoneNumber ?? '없음'} />
            {data.participant && (
              <Field
                label="대표 수신 번호"
                value={data.participant.notificationPhoneNumber ?? '없음'}
              />
            )}
          </dl>
          {row.isReservation && (
            <p className="text-caption1r text-gray-400">
              User 저장 전이라 참가자 ID와 QR이 없습니다. 동행자는 아래 제출
              당시 답변으로 확인합니다.
            </p>
          )}
        </section>

        <section className="space-y-[10px]">
          <p className="text-h3b text-black">신청</p>
          <dl className="space-y-8">
            <Field label="회차" value={sessionLabel(row.sessionId)} />
            <Field label="상태" value={PREREGISTER_STATUS_LABEL[row.status]} />
            <Field
              label="신청일시"
              value={
                row.createdAt ? formatDateTime(row.createdAt) : '기록 없음'
              }
            />
            <Field
              label="행 ID"
              value={<span className="break-all">{data.key}</span>}
            />
          </dl>
        </section>

        {data.participant && (
          <section className="space-y-[10px]">
            <p className="text-h3b text-black">참가자 등록 답변 (현재)</p>
            <AnswerList
              questions={null}
              answers={data.participant.information}
              currentInfo
            />
          </section>
        )}

        {data.reservation && (
          <section className="space-y-[10px]">
            <p className="text-h3b text-black">제출 당시 답변</p>
            <AnswerList
              questions={data.reservation.questions ?? null}
              answers={data.reservation.informationJson ?? null}
            />
          </section>
        )}

        <p className="text-caption1r text-gray-400">
          사전등록 관리자 취소는 서버 계약 확장 전이라 제공하지 않습니다.
        </p>
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
