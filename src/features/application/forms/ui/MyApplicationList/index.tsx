'use client';

import { useQuery } from '@tanstack/react-query';
import { QRCodeCanvas } from 'qrcode.react';
import { useRef, useState } from 'react';
import {
  LEDGER_STATUS_LABEL,
  OCCUPATION_LABEL,
  PROGRAM_TYPE_LABEL,
} from '@/features/registration/common/model/ledger';
import { downloadQrImage } from '@/shared/libs/downloadQrImage';
import {
  getParticipantQr,
  OwnerApplication,
  OwnerApplicationType,
  OwnerParticipant,
} from '../../api/myApplications';
import { useMyApplications } from '../../model/useMyApplications';

const TYPE_LABEL: Record<OwnerApplicationType, string> = {
  PREREGISTER: '사전등록',
  ...PROGRAM_TYPE_LABEL,
};

const BLOCKED_REASON_LABEL: Record<string, string> = {
  CANCELLED: '이미 취소된 신청입니다.',
  EXTERNAL_CONTRACT_REQUIRED:
    '지금은 취소할 수 없습니다. 운영 측에 문의해주세요.',
  OWNERSHIP_CHANGED: '대표자 정보가 바뀌어 취소할 수 없습니다.',
  PARTICIPANT_STATE_CHANGED: '참가자 정보가 바뀌어 취소할 수 없습니다.',
  ENTERED: '이미 입장해 취소할 수 없습니다.',
  ATTENDED: '프로그램에 출석해 취소할 수 없습니다.',
  CANCELLATION_IN_PROGRESS: '취소를 처리하고 있습니다.',
  DEADLINE_UNSET: '취소 마감이 정해지지 않아 취소할 수 없습니다.',
  DEADLINE_EXPIRED: '취소 기간이 지났습니다.',
  PROGRAM_CHANGE_PENDING: '프로그램 변경이 진행 중이라 취소할 수 없습니다.',
  SESSION_CHANGE_PENDING: '회차 변경이 진행 중이라 취소할 수 없습니다.',
  APPLICATION_STATE_CHANGED: '신청 상태가 바뀌었습니다. 새로고침해주세요.',
  ACTIVE_PROGRAMS: '신청한 프로그램을 먼저 취소해야 합니다.',
  ACTIVE_COMPANIONS: '일행의 사전등록을 먼저 취소해야 합니다.',
};

interface QrTarget {
  participantId: number;
  title: string;
}

interface CancelTarget {
  type: OwnerApplicationType;
  applicationId: string;
  title: string;
}

const ApplicationRow = ({
  application,
  participant,
  onCancel,
  onShowQr,
}: {
  application: OwnerApplication;
  participant?: OwnerParticipant;
  onCancel: (target: CancelTarget) => void;
  onShowQr: (target: QrTarget) => void;
}) => {
  const {
    type,
    applicationId,
    status,
    cancellable,
    cancellationBlockedReason,
  } = application;
  const title = [participant?.name, TYPE_LABEL[type]]
    .filter(Boolean)
    .join(' · ');

  return (
    <li className="flex items-center justify-between gap-12 py-12 mobile:flex-col mobile:items-stretch">
      <div className="flex flex-wrap items-center gap-8">
        <p className="text-body2b text-black">{title}</p>
        {participant && (
          <p className="text-body2r text-gray-500">
            {participant.representative ? '대표자' : '참여자'} ·{' '}
            {participant.occupation &&
              (OCCUPATION_LABEL[participant.occupation] ??
                participant.occupation)}
          </p>
        )}
        <p className="text-caption1b text-main-600">
          {LEDGER_STATUS_LABEL[status] ?? status}
        </p>
      </div>

      <div className="flex items-center gap-8 mobile:[&>button]:flex-1">
        {status === 'CONFIRMED' && (
          <button
            type="button"
            onClick={() =>
              onShowQr({ participantId: application.participantId, title })
            }
            className="whitespace-nowrap rounded-sm bg-main-600 px-16 py-8 text-caption1b text-white"
          >
            QR 보기
          </button>
        )}
        {cancellable ? (
          <button
            type="button"
            onClick={() => onCancel({ type, applicationId, title })}
            className="whitespace-nowrap rounded-sm border-1 border-solid border-error px-16 py-8 text-caption1b text-error"
          >
            신청취소
          </button>
        ) : (
          cancellationBlockedReason && (
            <p className="text-caption1r text-gray-500">
              {BLOCKED_REASON_LABEL[cancellationBlockedReason] ??
                cancellationBlockedReason}
            </p>
          )
        )}
      </div>
    </li>
  );
};

const Dialog = ({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <div
    role="dialog"
    aria-modal
    className="fixed inset-0 z-10 flex items-center justify-center px-[18px]"
    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    onClick={onClose}
  >
    <div
      className="flex w-full max-w-[360px] flex-col items-center gap-16 rounded-sm bg-white p-24"
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

const QrDialog = ({
  expoId,
  target,
  onClose,
}: {
  expoId: string;
  target: QrTarget;
  onClose: () => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { data } = useQuery({
    queryKey: ['participantQr', expoId, target.participantId],
    queryFn: () => getParticipantQr(expoId, target.participantId),
    retry: false,
  });

  return (
    <Dialog onClose={onClose}>
      <p className="text-h3b text-black">{target.title}</p>
      {data && (
        <>
          <QRCodeCanvas
            ref={canvasRef}
            value={JSON.stringify({
              participantId: data.participantId,
              code: data.code,
            })}
            size={240}
            marginSize={2}
          />
          <p className="text-caption1r text-gray-500">
            현장 입장 시 이 QR을 보여주세요
          </p>
          <button
            type="button"
            onClick={() => downloadQrImage(canvasRef.current!, target.title)}
            className="w-full rounded-sm border-1 border-solid border-main-600 px-24 py-14 text-body2b text-main-600"
          >
            QR 저장
          </button>
        </>
      )}
      <button
        type="button"
        onClick={onClose}
        className="w-full rounded-sm bg-main-600 px-24 py-14 text-body2b text-white"
      >
        닫기
      </button>
    </Dialog>
  );
};

const MyApplicationList = ({ expoId }: { expoId: string }) => {
  const { participants, applications, errorMessage, cancel } =
    useMyApplications(expoId);
  const [qrTarget, setQrTarget] = useState<QrTarget | null>(null);
  const [cancelTarget, setCancelTarget] = useState<CancelTarget | null>(null);

  if (errorMessage) {
    return <p className="text-body2r text-error">{errorMessage}</p>;
  }
  if (applications.length === 0) return null;

  return (
    <section className="flex flex-col gap-12">
      <p className="text-body2r text-gray-600">
        <span className="text-body2b text-black">나의 신청 현황</span> · 한 번
        인증한 번호로 본인을 포함하여 최대 5명까지 함께 신청할 수 있습니다.
      </p>

      <ul className="flex flex-col divide-y divide-solid divide-gray-100 rounded-sm border-1 border-solid border-gray-200 bg-white px-18 py-6">
        {applications.map((application) => (
          <ApplicationRow
            key={`${application.type}-${application.applicationId}`}
            application={application}
            participant={participants.find(
              (participant) =>
                participant.participantId === application.participantId,
            )}
            onCancel={setCancelTarget}
            onShowQr={setQrTarget}
          />
        ))}
      </ul>

      {qrTarget && (
        <QrDialog
          expoId={expoId}
          target={qrTarget}
          onClose={() => setQrTarget(null)}
        />
      )}

      {cancelTarget && (
        <Dialog onClose={() => setCancelTarget(null)}>
          <p className="text-h3b text-black">신청을 취소할까요?</p>
          <p className="break-keep text-center text-body2r text-gray-500">
            {cancelTarget.title}의 신청이 취소됩니다.
          </p>
          <div className="flex w-full gap-8">
            <button
              type="button"
              onClick={() => setCancelTarget(null)}
              className="flex-1 rounded-sm bg-gray-100 px-24 py-14 text-body2b text-gray-700"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={() => {
                cancel(cancelTarget);
                setCancelTarget(null);
              }}
              className="flex-1 rounded-sm bg-error px-24 py-14 text-body2b text-white"
            >
              신청 취소
            </button>
          </div>
        </Dialog>
      )}
    </section>
  );
};

export default MyApplicationList;
