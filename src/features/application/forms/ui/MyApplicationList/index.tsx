'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { useRef, useState } from 'react';
import { downloadQrImage } from '@/shared/libs/downloadQrImage';
import { MyApplication, MyParticipant } from '../../api/myApplications';
import { FORM_GROUPS } from '../../constant/formEntries';
import { PARTICIPANT_TYPE_LABEL } from '../../constant/participant';
import { formatFormPeriod } from '../../model/formPeriodStatus';
import { useMyApplications } from '../../model/useMyApplications';

interface QrTarget {
  value: string;
  title: string;
  // 교사·예비교사만 있는 "00초 홍길동"
  detail?: string;
  // QR 하단 문구
  caption: string;
}

const toQrTarget = (
  { participantId, participantType, affiliation, name }: MyParticipant,
  index: number,
  phoneNumber: string,
  expoId: string,
): QrTarget => {
  const typeLabel = PARTICIPANT_TYPE_LABEL[participantType];
  const detail = affiliation && name ? `${affiliation} ${name}` : undefined;

  return {
    // printBadge 와 같은 페이로드라 현장 체크인 스캐너에서 그대로 읽힌다
    value: JSON.stringify({ participantId, phoneNumber, expoId }),
    title: `${index === 0 ? '대표자' : `참여자 ${index + 1}`} · ${typeLabel}`,
    detail,
    caption: detail ?? typeLabel,
  };
};

const ParticipantRow = ({
  target,
  onShowQr,
  onCancel,
}: {
  target: QrTarget;
  onShowQr: () => void;
  onCancel: () => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const saveQr = () => downloadQrImage(canvasRef.current!, target.caption);

  return (
    <li className="flex items-center justify-between gap-12 py-12 mobile:flex-col mobile:items-stretch">
      <div className="flex flex-wrap items-center gap-8">
        <p className="text-body2b text-black">{target.title}</p>
        {target.detail && (
          <p className="text-body2r text-gray-500">{target.detail}</p>
        )}
      </div>

      <div className="flex gap-8 mobile:[&>button]:flex-1">
        <button
          type="button"
          onClick={onShowQr}
          className="whitespace-nowrap rounded-sm bg-main-600 px-16 py-8 text-caption1b text-white"
        >
          QR 보기
        </button>
        <button
          type="button"
          onClick={saveQr}
          className="whitespace-nowrap rounded-sm border-1 border-solid border-main-600 px-16 py-8 text-caption1b text-main-600"
        >
          QR 저장
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="whitespace-nowrap rounded-sm border-1 border-solid border-error px-16 py-8 text-caption1b text-error"
        >
          신청취소
        </button>
      </div>

      <QRCodeCanvas
        ref={canvasRef}
        value={target.value}
        size={512}
        marginSize={2}
        className="hidden"
      />
    </li>
  );
};

const ApplicationItem = ({
  application,
  expoId,
  onShowQr,
  onCancel,
}: {
  application: MyApplication;
  expoId: string;
  onShowQr: (target: QrTarget) => void;
  onCancel: (participantId: number, title: string) => void;
}) => {
  const typeLabel = FORM_GROUPS.find(
    (group) => group.key === application.applicationType,
  )?.label;

  return (
    <li className="flex flex-col rounded-sm border-1 border-solid border-gray-200 bg-white px-18 py-6">
      <div className="flex items-center justify-between gap-12 border-b-1 border-solid border-gray-100 py-12">
        <div className="flex flex-wrap items-center gap-12">
          <span className="rounded-sm border-1 border-solid border-gray-200 px-12 py-4 text-caption1r text-gray-500">
            {typeLabel}
          </span>
          <p className="text-body1b text-black">
            {formatFormPeriod(application.sessionStartedAt)}
          </p>
          <p className="text-caption1b text-main-600">
            신청완료 · {application.participants.length}명
          </p>
        </div>
      </div>

      <ul className="flex flex-col divide-y divide-solid divide-gray-100">
        {application.participants.map((participant, index) => {
          const target = toQrTarget(
            participant,
            index,
            application.phoneNumber,
            expoId,
          );
          return (
            <ParticipantRow
              key={participant.participantId}
              target={target}
              onShowQr={() => onShowQr(target)}
              onCancel={() => onCancel(participant.participantId, target.title)}
            />
          );
        })}
      </ul>
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

const MyApplicationList = ({ expoId }: { expoId: string }) => {
  const { applications, cancel } = useMyApplications(expoId);
  const [qrTarget, setQrTarget] = useState<QrTarget | null>(null);
  const [cancelTarget, setCancelTarget] = useState<{
    participantId: number;
    title: string;
  } | null>(null);

  if (applications.length === 0) return null;

  return (
    <section className="flex flex-col gap-12">
      <p className="text-body2r text-gray-600">
        <span className="text-body2b text-black">나의 신청 현황</span> · 한 번
        인증한 번호로 본인을 포함하여 최대 5명까지 함께 신청할 수 있습니다.
      </p>

      <ul className="flex flex-col gap-8">
        {applications.map((application) => (
          <ApplicationItem
            key={application.applicationId}
            application={application}
            expoId={expoId}
            onShowQr={setQrTarget}
            onCancel={(participantId, title) =>
              setCancelTarget({ participantId, title })
            }
          />
        ))}
      </ul>

      {qrTarget && (
        <Dialog onClose={() => setQrTarget(null)}>
          <p className="text-h3b text-black">{qrTarget.title}</p>
          <div className="flex flex-col items-center gap-8">
            <QRCodeCanvas value={qrTarget.value} size={240} marginSize={2} />
            <p className="text-body1b text-black">{qrTarget.caption}</p>
          </div>
          <p className="text-caption1r text-gray-500">
            현장 입장 시 이 QR을 보여주세요
          </p>
          <button
            type="button"
            onClick={() => setQrTarget(null)}
            className="w-full rounded-sm bg-main-600 px-24 py-14 text-body2b text-white"
          >
            닫기
          </button>
        </Dialog>
      )}

      {cancelTarget && (
        <Dialog onClose={() => setCancelTarget(null)}>
          <p className="text-h3b text-black">신청을 취소할까요?</p>
          <p className="break-keep text-center text-body2r text-gray-500">
            {cancelTarget.title}의 신청이 취소되며
            <br />
            QR도 사용할 수 없게 됩니다.
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
                cancel(cancelTarget.participantId);
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
