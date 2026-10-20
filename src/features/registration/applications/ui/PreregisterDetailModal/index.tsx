'use client';

import { useEffect, useState } from 'react';
import { AnswerList } from '@/entities/form';
import { XMark } from '@/shared/assets/icons';
import { Button, Loading } from '@/shared/ui';
import { formatDateTime, SectionError } from '../../../common';
import { OCCUPATION_LABEL } from '../../../common/model/ledger';
import {
  getPreregisterErrorMessage,
  isPreregisterCancellable,
  parseInformationJson,
  PREREGISTER_STATUS_LABEL,
  PreregisterRow,
  toPreregisterRow,
  useCancelPreregistration,
  usePreregisterDetail,
  usePreregisterParty,
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

const RELATION_LABEL = {
  REPRESENTATIVE: '대표자',
  COMPANION: '동행자',
  PARTY: '대기 일행',
} as const;

/**
 * 확정 행은 취소, 대기 행은 대기 철회. 누르면 바로 보내지 않고 대상 이름·인원을 확인받는다.
 * 대표자는 동행자가 남아 있으면 혼자 취소할 수 없어(서버 409) 같은 일행 전체를 함께 취소한다
 */
const CancelSection = ({
  expoId,
  row,
}: {
  expoId: string;
  row: PreregisterRow;
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const cancellation = useCancelPreregistration(expoId);
  const party = usePreregisterParty(expoId, row, isConfirming);
  const isWithdrawal = row.status === 'WAITING';
  const isParty = row.relation === 'REPRESENTATIVE' && !isWithdrawal;
  // 일행 조회 사이에 상태가 바뀌어 대표자가 빠졌으면 대표자만 대상으로 둔다. 서버가 다시 판정한다
  const targets = isParty
    ? party.data?.length
      ? party.data
      : party.isSuccess
        ? [row]
        : null
    : [row];
  const people = targets?.reduce((sum, target) => sum + target.applicants, 0);
  const action = isWithdrawal ? '대기 철회' : '취소';

  const handleConfirm = () => {
    if (!targets || cancellation.isPending) return;
    cancellation.mutate(
      { keys: targets.map((target) => target.id), isWithdrawal },
      { onSuccess: () => setIsConfirming(false) },
    );
  };

  if (!isConfirming) {
    return (
      <section className="space-y-[10px]">
        <p className="text-caption1r text-gray-400">
          이미 입장한 참가자이거나 취소 기간이 끝났으면 서버가 {action}를
          거절합니다.
        </p>
        <Button variant="white" onClick={() => setIsConfirming(true)}>
          {action}
        </Button>
      </section>
    );
  }

  return (
    <section
      role="alertdialog"
      aria-labelledby="preregister-cancel-title"
      className="space-y-[12px] rounded-sm border-1 border-solid border-error p-18"
    >
      <p id="preregister-cancel-title" className="text-body2b text-black">
        {isWithdrawal
          ? '선택한 대기 신청을 철회하시겠습니까? 철회한 대기 신청은 복구할 수 없습니다.'
          : '선택한 사전등록 신청을 취소하시겠습니까? 취소한 신청은 복구할 수 없습니다.'}
      </p>
      {isParty && (
        <p className="text-caption1r text-gray-500">
          대표자는 동행자가 남아 있으면 혼자 취소할 수 없어 같은 일행을 함께
          취소합니다. 동행자만 취소하려면 동행자 행에서 취소하세요.
        </p>
      )}
      {party.isError ? (
        <SectionError
          message={getPreregisterErrorMessage(
            party.error,
            '같은 일행을 불러오지 못했습니다.',
          )}
          onRetry={() => party.refetch()}
        />
      ) : !targets ? (
        <div className="flex justify-center py-12">
          <Loading />
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {targets.map((target) => (
              <li key={target.id} className="text-body2r text-black">
                {target.name ?? '이름 없음'} · {RELATION_LABEL[target.relation]}
                {target.relation === 'PARTY' && ` ${target.applicants}명`}
              </li>
            ))}
          </ul>
          <p className="text-body2b text-black">총 {people}명</p>
        </>
      )}
      <div className="flex gap-12">
        <Button
          disabled={!targets || cancellation.isPending}
          onClick={handleConfirm}
        >
          {cancellation.isPending ? `${action} 중...` : '확인'}
        </Button>
        <Button
          variant="white"
          disabled={cancellation.isPending}
          onClick={() => setIsConfirming(false)}
        >
          취소
        </Button>
      </div>
    </section>
  );
};

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
    // 서버가 User 현재 답변을 { answers, questions } 로 주지만 answers 는 문항 제목이 키라 질문과 짝짓지 않고 그대로 보여 준다
    const participantInfo = data.participant?.information as {
      answers?: Record<string, unknown> | null;
    } | null;
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
            {row.cancellationActor && (
              <Field
                label="취소 처리"
                value={`${row.cancellationActor}${row.cancelledAt ? ` · ${formatDateTime(row.cancelledAt)}` : ''}`}
              />
            )}
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
              answers={participantInfo?.answers ?? null}
              currentInfo
            />
          </section>
        )}

        {data.reservation && (
          <section className="space-y-[10px]">
            <p className="text-h3b text-black">제출 당시 답변</p>
            <AnswerList
              questions={data.reservation.questions ?? null}
              answers={parseInformationJson(data.reservation.informationJson)}
            />
          </section>
        )}

        {isPreregisterCancellable(row) && (
          <CancelSection key={row.id} expoId={expoId} row={row} />
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
