'use client';

import { useQuery } from '@tanstack/react-query';
import { QRCodeCanvas } from 'qrcode.react';
import { useRef, useState } from 'react';
import { AnswerList } from '@/entities/form';
import { SessionNotice, getSessionIssue } from '@/features/phone-verification';
import {
  LEDGER_STATUS_LABEL,
  OCCUPATION_LABEL,
  formatDefinitionSchedule,
  PROGRAM_TYPE_LABEL,
} from '@/features/registration/common/model/ledger';
import { downloadQrImage } from '@/shared/libs/downloadQrImage';
import { useModalDialog } from '@/shared/model';
import {
  getParticipantQr,
  OwnerApplication,
  OwnerApplicationType,
  OwnerParticipant,
} from '../../api/myApplications';
import {
  SessionInfo,
  useApplicationSessions,
} from '../../model/useApplicationSessions';
import { useMyApplications } from '../../model/useMyApplications';
import PreRegisterWaitlist from '../PreRegisterWaitlist';

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
  ACTIVE_PROGRAMS:
    '이 참가자가 신청한 프로그램을 먼저 취소해야 사전등록을 취소할 수 있습니다.',
  ACTIVE_COMPANIONS:
    '동행자의 사전등록을 먼저 취소해주세요. 대표자는 마지막에 취소할 수 있습니다.',
};

interface QrTarget {
  participantId: number;
  title: string;
}

interface CancelTarget {
  type: OwnerApplicationType;
  applicationId: string;
  title: string;
  // 어느 참가자의 어느 회차인지 확인 문구
  session: string;
}

const SESSION_STATE_NOTE: Partial<Record<SessionInfo['state'], string>> = {
  loading: '회차 정보를 불러오는 중입니다.',
  error: '회차 정보를 불러오지 못했습니다.',
  missing: '삭제되었거나 변경되어 회차 정보를 찾을 수 없습니다.',
};

const ApplicationRow = ({
  application,
  participant,
  onCancel,
  onShowQr,
  session,
}: {
  application: OwnerApplication;
  participant?: OwnerParticipant;
  session: SessionInfo;
  onCancel: (target: CancelTarget) => void;
  onShowQr: (target: QrTarget) => void;
}) => {
  const {
    type,
    applicationId,
    status,
    cancellable,
    cancellationBlockedReason,
    questions,
    answers,
  } = application;
  const sessionLabel = `${session.title}${session.startedAt ? ` (${formatDefinitionSchedule(session.startedAt, session.endedAt)})` : ''}`;
  const reasonId = `cancel-blocked-${type}-${applicationId}`;
  const title = [participant?.name, TYPE_LABEL[type]]
    .filter(Boolean)
    .join(' · ');

  return (
    <li className="flex flex-col gap-8 py-12">
      <div className="flex items-center justify-between gap-12 mobile:flex-col mobile:items-stretch">
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
              onClick={() =>
                onCancel({
                  type,
                  applicationId,
                  title,
                  session: sessionLabel,
                })
              }
              className="whitespace-nowrap rounded-sm border-1 border-solid border-error px-16 py-8 text-caption1b text-error"
            >
              신청취소
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled
                aria-describedby={reasonId}
                className="whitespace-nowrap rounded-sm border-1 border-solid border-gray-200 px-16 py-8 text-caption1b text-gray-400"
              >
                신청취소
              </button>
              <p id={reasonId} className="text-caption1r text-gray-500">
                {BLOCKED_REASON_LABEL[cancellationBlockedReason] ??
                  (cancellationBlockedReason ||
                    '지금은 취소할 수 없습니다. 운영 측에 문의해주세요.')}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-body2b text-black">{session.title}</p>
        {session.startedAt && (
          <p className="text-caption1r text-gray-500">
            {formatDefinitionSchedule(session.startedAt, session.endedAt)}
          </p>
        )}
        {SESSION_STATE_NOTE[session.state] && (
          <p className="text-caption1r text-gray-500">
            {SESSION_STATE_NOTE[session.state]}
          </p>
        )}
      </div>

      <details className="rounded-sm bg-gray-50 px-12 py-8">
        <summary className="cursor-pointer text-caption1b text-gray-600">
          신청 당시 답변
        </summary>
        <div className="pt-8">
          {questions == null && answers == null ? (
            <p className="text-caption1r text-gray-500">
              접수 당시 문항과 답변이 저장되어 있지 않습니다.
            </p>
          ) : (
            <AnswerList questions={questions} answers={answers} />
          )}
        </div>
      </details>
    </li>
  );
};

const Dialog = ({
  label,
  onClose,
  children,
}: {
  label: string;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  const dialogRef = useModalDialog({ onClose });
  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center px-[18px]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className="flex w-full max-w-[360px] flex-col items-center gap-16 rounded-sm bg-white p-24 outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

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
  const { data, error, isFetching, refetch } = useQuery({
    queryKey: ['participantQr', expoId, target.participantId],
    queryFn: () => getParticipantQr(expoId, target.participantId),
    retry: false,
    // 실패는 아래에서 다시 시도할 수 있게 안내한다
    meta: { silent: true },
  });
  const sessionIssue = getSessionIssue(error);

  return (
    <Dialog label={`${target.title} 입장 QR`} onClose={onClose}>
      <p className="text-h3b text-black">{target.title}</p>
      {!data && isFetching && (
        <p role="status" className="text-body2r text-gray-500">
          QR 을 불러오는 중입니다...
        </p>
      )}
      {!data && !isFetching && error && (
        <div className="flex w-full flex-col gap-12">
          {sessionIssue ? (
            <SessionNotice expoId={expoId} issue={sessionIssue} />
          ) : (
            <>
              <p role="alert" className="break-keep text-body2r text-error">
                {error.message}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="w-full rounded-sm border-1 border-solid border-main-600 px-24 py-14 text-body2b text-main-600"
              >
                다시 시도
              </button>
            </>
          )}
        </div>
      )}
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
  const {
    participants,
    applications,
    sessionIssue,
    errorMessage,
    retry,
    waitlist,
    waitlistErrorMessage,
    cancel,
    cancelWaitlist,
    isCancellingWaitlist,
  } = useMyApplications(expoId);
  const { getSession, hasLookupError, retryLookup } = useApplicationSessions(
    expoId,
    applications,
  );
  const [qrTarget, setQrTarget] = useState<QrTarget | null>(null);
  const [cancelTarget, setCancelTarget] = useState<CancelTarget | null>(null);
  const [isWaitlistCancelOpen, setIsWaitlistCancelOpen] = useState(false);

  // 조회 실패를 신청 없음으로 보이지 않게 오류를 그대로 알린다
  if (
    applications.length === 0 &&
    !waitlist &&
    !errorMessage &&
    !waitlistErrorMessage &&
    !sessionIssue
  )
    return null;

  return (
    <section className="flex flex-col gap-12">
      <p className="text-body2r text-gray-600">
        <span className="text-body2b text-black">나의 신청 현황</span> · 한 번
        인증한 번호로 본인을 포함하여 최대 5명까지 함께 신청할 수 있습니다.
      </p>

      {sessionIssue && <SessionNotice expoId={expoId} issue={sessionIssue} />}
      {(errorMessage || waitlistErrorMessage) && (
        <div role="alert" className="flex flex-col gap-8">
          {errorMessage && (
            <p className="text-body2r text-error">{errorMessage}</p>
          )}
          {waitlistErrorMessage && (
            <p className="text-body2r text-error">
              대기 내역: {waitlistErrorMessage}
            </p>
          )}
          <button
            type="button"
            onClick={() => retry()}
            className="self-start rounded-sm border-1 border-solid border-main-600 px-16 py-8 text-caption1b text-main-600"
          >
            다시 시도
          </button>
        </div>
      )}

      {!sessionIssue && hasLookupError && (
        <div role="alert" className="flex flex-col gap-8">
          <p className="text-body2r text-error">
            프로그램·회차 이름과 일정을 불러오지 못했습니다. 신청 내역은 아래에
            회차 번호로 표시됩니다.
          </p>
          <button
            type="button"
            onClick={() => retryLookup()}
            className="self-start rounded-sm border-1 border-solid border-main-600 px-16 py-8 text-caption1b text-main-600"
          >
            다시 시도
          </button>
        </div>
      )}

      {!sessionIssue && waitlist && (
        <PreRegisterWaitlist
          waitlist={waitlist}
          onCancel={() => setIsWaitlistCancelOpen(true)}
          isCancelling={isCancellingWaitlist}
        />
      )}

      {!sessionIssue && applications.length > 0 && (
        <ul className="flex flex-col divide-y divide-solid divide-gray-100 rounded-sm border-1 border-solid border-gray-200 bg-white px-18 py-6">
          {applications.map((application) => (
            <ApplicationRow
              key={`${application.type}-${application.applicationId}`}
              application={application}
              participant={participants.find(
                (participant) =>
                  participant.participantId === application.participantId,
              )}
              session={getSession(application)}
              onCancel={setCancelTarget}
              onShowQr={setQrTarget}
            />
          ))}
        </ul>
      )}

      {qrTarget && (
        <QrDialog
          expoId={expoId}
          target={qrTarget}
          onClose={() => setQrTarget(null)}
        />
      )}

      {cancelTarget && (
        <Dialog label="신청 취소 확인" onClose={() => setCancelTarget(null)}>
          <p className="text-h3b text-black">신청을 취소할까요?</p>
          <p className="break-keep text-center text-body2r text-gray-500">
            {cancelTarget.title}
            <br />
            {cancelTarget.session}
            <br />이 신청이 취소됩니다. 다시 신청하면 새 신청으로 처리되어 지금
            자리가 보장되지 않습니다.
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

      {isWaitlistCancelOpen && (
        <Dialog
          label="대기 신청 취소 확인"
          onClose={() => setIsWaitlistCancelOpen(false)}
        >
          <p className="text-h3b text-black">대기 신청을 취소할까요?</p>
          <p className="break-keep text-center text-body2r text-gray-500">
            일행 전체의 대기가 함께 취소되고 대기 순번이 사라집니다. 다시
            신청하면 새 신청으로 맨 뒤에 접수됩니다.
          </p>
          <div className="flex w-full gap-8">
            <button
              type="button"
              onClick={() => setIsWaitlistCancelOpen(false)}
              className="flex-1 rounded-sm bg-gray-100 px-24 py-14 text-body2b text-gray-700"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={() => {
                cancelWaitlist();
                setIsWaitlistCancelOpen(false);
              }}
              className="flex-1 rounded-sm bg-error px-24 py-14 text-body2b text-white"
            >
              대기 취소
            </button>
          </div>
        </Dialog>
      )}
    </section>
  );
};

export default MyApplicationList;
