'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
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
  COMPANIONS_ACTIVE_MESSAGE,
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
import { usePreRegisterSessions } from '../../model/usePreRegister';
import AddCompanionDialog, { AddCompanionTarget } from '../AddCompanionDialog';
import AddSessionDialog from '../AddSessionDialog';
import OwnTeacherSeats from '../OwnTeacherSeats';
import PreRegisterWaitlist from '../PreRegisterWaitlist';
import PromotionOffer from '../PromotionOffer';

const TYPE_LABEL: Record<OwnerApplicationType, string> = {
  PREREGISTER: '사전등록',
  ...PROGRAM_TYPE_LABEL,
  STANDARD: '프로그램',
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
  COMPANIONS_ACTIVE: COMPANIONS_ACTIVE_MESSAGE,
};

// 서버가 학생·보호자 연결 정보를 주지 않으므로 학생 신청에만 일반 안내를 한다.
// 마지막 연결 학생을 취소하면 서버가 보호자 신청도 함께 취소하고, 다른 학생이 있으면 보호자는 유지한다
const GUARDIAN_CANCEL_NOTE =
  '보호자와 함께 신청한 마지막 학생이면 보호자의 신청도 함께 취소됩니다. 같은 보호자에 연결된 다른 학생이 있으면 보호자는 유지됩니다.';

const getGuardianCancelNote = (
  application: OwnerApplication,
  participant?: OwnerParticipant,
) =>
  application.type !== 'PREREGISTER' &&
  participant?.occupation === 'ELEMENTARY_STUDENT'
    ? GUARDIAN_CANCEL_NOTE
    : undefined;

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
  // 학생 신청에 연결된 보호자가 있을 때의 안내(마지막 연결 학생이면 보호자도 함께 취소된다)
  guardianNote?: string;
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
  onAddCompanion,
  session,
  expoId,
}: {
  expoId: string;
  application: OwnerApplication;
  participant?: OwnerParticipant;
  session: SessionInfo;
  onCancel: (target: CancelTarget) => void;
  onShowQr: (target: QrTarget) => void;
  onAddCompanion: (target: AddCompanionTarget) => void;
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
  const blockedReason =
    BLOCKED_REASON_LABEL[cancellationBlockedReason] ??
    (cancellationBlockedReason ||
      '지금은 취소할 수 없습니다. 운영 측에 문의해주세요.');
  // 동행자를 먼저 취소하면 풀리는 사유라 누르기 전에도 줄 아래에 보여 준다
  const showsBlockedReason =
    !cancellable &&
    status !== 'CANCELLED' &&
    cancellationBlockedReason === 'COMPANIONS_ACTIVE';
  const title = [participant?.name, TYPE_LABEL[type]]
    .filter(Boolean)
    .join(' · ');
  // 서버가 대표자 본인의 확정 사전등록에만 true 를 준다. 일행이 5명이 찼거나 자리가 없으면 남은 인원이 0이다
  const remainingCompanionSlots = application.companionAddable
    ? (application.remainingCompanionSlots ?? 0)
    : 0;

  return (
    <li className="flex flex-col gap-12 py-16">
      <div className="flex items-center justify-between gap-12 mobile:flex-col mobile:items-stretch">
        <div className="flex flex-wrap items-center gap-8">
          <p className="text-body2b text-black">{TYPE_LABEL[type]}</p>
          <p className="rounded-full bg-main-100 px-8 py-2 text-caption1b text-main-600">
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
          {type === 'PREREGISTER' && remainingCompanionSlots > 0 && (
            <button
              type="button"
              onClick={() =>
                onAddCompanion({
                  applicationId,
                  title,
                  session: sessionLabel,
                  remaining: remainingCompanionSlots,
                })
              }
              className="whitespace-nowrap rounded-sm border-1 border-solid border-main-600 px-16 py-8 text-caption1b text-main-600"
            >
              일행에 사람 추가
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
                  guardianNote: getGuardianCancelNote(application, participant),
                })
              }
              className="whitespace-nowrap rounded-sm border-1 border-solid border-error px-16 py-8 text-caption1b text-error"
            >
              신청취소
            </button>
          ) : status === 'CANCELLED' ? null : (
            // 취소할 수 없는 사유는 줄마다 펼쳐 두지 않고, 버튼을 누르면 알림으로 알려 준다
            <button
              type="button"
              aria-disabled
              aria-describedby={reasonId}
              onClick={() => toast.info(blockedReason)}
              className="whitespace-nowrap rounded-sm border-1 border-solid border-gray-200 px-16 py-8 text-caption1b text-gray-400"
            >
              신청취소
              {!showsBlockedReason && (
                <span id={reasonId} className="sr-only">
                  {blockedReason}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <p className="break-words break-keep text-body2b text-black">
          {session.title}
        </p>
        {session.startedAt && (
          <p className="text-caption1r text-gray-500">
            {formatDefinitionSchedule(session.startedAt, session.endedAt)}
          </p>
        )}
        {session.place && (
          <p className="break-words break-keep text-caption1r text-gray-500">
            장소: {session.place}
          </p>
        )}
        {type === 'PREREGISTER' && status === 'CONFIRMED' && (
          <OwnTeacherSeats
            expoId={expoId}
            sessionId={String(application.sessionOrProgramId)}
          />
        )}
        {showsBlockedReason && (
          <p id={reasonId} className="break-keep text-caption1r text-gray-500">
            {blockedReason}
          </p>
        )}
        {SESSION_STATE_NOTE[session.state] && (
          <p className="text-caption1r text-gray-500">
            {SESSION_STATE_NOTE[session.state]}
          </p>
        )}
      </div>

      <details className="rounded-sm bg-gray-100 px-12 py-8">
        <summary className="cursor-pointer text-caption1b text-gray-600">
          신청 당시 답변
        </summary>
        <div className="pt-8">
          {questions == null && answers == null ? (
            <p className="text-caption1r text-gray-500">
              접수 당시 문항과 답변이 저장되어 있지 않습니다.
            </p>
          ) : (
            <AnswerList questions={questions} answers={answers} hideEmpty />
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
    waitlists,
    waitlistErrorMessage,
    cancel,
    cancelWaitlist,
    isCancellingWaitlist,
    offers,
    respondOffer,
    isRespondingOffer,
    addCompanions,
    isAddingCompanions,
    addSession,
    isAddingSession,
  } = useMyApplications(expoId);
  const { getSession, hasLookupError, retryLookup } = useApplicationSessions(
    expoId,
    applications,
  );
  const [qrTarget, setQrTarget] = useState<QrTarget | null>(null);
  const [cancelTarget, setCancelTarget] = useState<CancelTarget | null>(null);
  // 대기 취소를 확인받을 회차. 회차마다 따로 대기할 수 있다
  const [waitlistCancelSessionId, setWaitlistCancelSessionId] = useState<
    number | null
  >(null);
  const [declineOfferId, setDeclineOfferId] = useState<string | null>(null);
  const [companionTarget, setCompanionTarget] =
    useState<AddCompanionTarget | null>(null);
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const { data: preRegisterSessions = [] } = usePreRegisterSessions(expoId);
  // 다른 화면(프로그램 신청 등)에서 회차를 골라 들어오면 그 회차를 미리 선택해 추가 화면을 연다
  const addSessionIdParam = Number(useSearchParams().get('addSessionId'));
  const initialAddSessionId = Number.isInteger(addSessionIdParam)
    ? addSessionIdParam
    : undefined;
  // 확정된 사전등록이 있어야 다른 회차를 추가할 수 있다
  const canAddSession = applications.some(
    ({ type, status }) => type === 'PREREGISTER' && status === 'CONFIRMED',
  );
  const autoOpened = useRef(false);
  useEffect(() => {
    if (autoOpened.current || !initialAddSessionId || !canAddSession) return;
    autoOpened.current = true;
    setIsAddSessionOpen(true);
  }, [initialAddSessionId, canAddSession]);

  // 취소된 신청은 숨긴다(관리자 화면에서만 본다). 서버 응답은 동행자 추가 판단에도 쓰므로 여기서만 거른다
  const visibleApplications = applications.filter(
    (a) => a.status !== 'CANCELLED',
  );

  // 참가자별로 묶고 대표자를 먼저 둔다. 서버가 주는 참가자 순서와 신청 순서는 그대로 지킨다.
  // 활성 신청이 없는 참가자는 목록에서 빠진다
  const groups = Array.from(
    new Set(visibleApplications.map((a) => a.participantId)),
  )
    .map((participantId) => ({
      participantId,
      participant: participants.find((p) => p.participantId === participantId),
      active: visibleApplications.filter(
        (a) => a.participantId === participantId,
      ),
    }))
    .sort(
      (a, b) =>
        Number(b.participant?.representative ?? false) -
        Number(a.participant?.representative ?? false),
    );

  // 조회 실패를 신청 없음으로 보이지 않게 오류를 그대로 알린다
  if (
    visibleApplications.length === 0 &&
    waitlists.length === 0 &&
    offers.length === 0 &&
    !errorMessage &&
    !waitlistErrorMessage &&
    !sessionIssue
  )
    return (
      <p className="flex flex-1 items-center justify-center text-body1r text-gray-500 mobile:text-body2r">
        신청 내역이 없습니다
      </p>
    );

  return (
    <section className="flex flex-col gap-12">
      <div className="flex flex-wrap items-center justify-between gap-8">
        <p className="text-body2b text-black">나의 신청 현황</p>
        {!sessionIssue && canAddSession && (
          <button
            type="button"
            onClick={() => setIsAddSessionOpen(true)}
            className="whitespace-nowrap rounded-sm border-1 border-solid border-main-600 px-16 py-8 text-caption1b text-main-600"
          >
            다른 회차 추가
          </button>
        )}
      </div>
      {/* 재신청은 문자를 다시 보내지 않아 QR 문자를 잃어버린 사람은 여기서 확인한다(Expo-User-Server#164) */}
      {visibleApplications.length > 0 && (
        <p className="break-keep text-body2r text-gray-500">
          QR 문자를 받지 못하셨나요? 아래 신청의 &apos;QR 보기&apos;에서 QR을
          확인할 수 있습니다. 다시 신청해도 QR 문자는 다시 발송되지 않습니다.
        </p>
      )}

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

      {!sessionIssue &&
        offers.map((offer) => (
          <PromotionOffer
            key={offer.offerId}
            offer={offer}
            isResponding={isRespondingOffer}
            onAccept={() =>
              respondOffer({ offerId: offer.offerId, action: 'acceptance' })
            }
            onDecline={() => setDeclineOfferId(offer.offerId)}
          />
        ))}

      {!sessionIssue &&
        waitlists.map((waitlist) => (
          <PreRegisterWaitlist
            key={waitlist.sessionId}
            expoId={expoId}
            waitlist={waitlist}
            onCancel={() => setWaitlistCancelSessionId(waitlist.sessionId)}
            isCancelling={isCancellingWaitlist}
          />
        ))}

      {!sessionIssue &&
        groups.map(({ participantId, participant, active }, index) => {
          const renderRow = (application: OwnerApplication) => (
            <ApplicationRow
              key={`${application.type}-${application.applicationId}`}
              expoId={expoId}
              application={application}
              participant={participant}
              session={getSession(application)}
              onCancel={setCancelTarget}
              onShowQr={setQrTarget}
              onAddCompanion={setCompanionTarget}
            />
          );
          return (
            // 신청이 쌓여도 사람별로 접어 둔다
            <details
              key={participantId}
              open={index === 0}
              className="rounded-sm border-1 border-solid border-gray-200 bg-white px-18 py-6 [&[open]>summary]:border-b-1 [&[open]>summary]:border-solid [&[open]>summary]:border-gray-100"
            >
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-8 py-12 [&::-webkit-details-marker]:hidden">
                <span className="text-body2b text-black">
                  {participant?.name ?? '참가자'}
                </span>
                {participant && (
                  <span className="text-body2r text-gray-500">
                    {participant.representative ? '대표자' : '참여자'}
                    {participant.occupation &&
                      ` · ${OCCUPATION_LABEL[participant.occupation] ?? participant.occupation}`}
                  </span>
                )}
                <span className="text-caption1b text-main-600">
                  신청 {active.length}건
                </span>
              </summary>
              <ul className="flex flex-col divide-y divide-solid divide-gray-100">
                {active.map(renderRow)}
              </ul>
            </details>
          );
        })}

      {qrTarget && (
        <QrDialog
          expoId={expoId}
          target={qrTarget}
          onClose={() => setQrTarget(null)}
        />
      )}

      {companionTarget && (
        <AddCompanionDialog
          expoId={expoId}
          target={companionTarget}
          isSubmitting={isAddingCompanions}
          onSubmit={addCompanions}
          onClose={() => setCompanionTarget(null)}
        />
      )}

      {isAddSessionOpen && (
        <AddSessionDialog
          expoId={expoId}
          sessions={preRegisterSessions}
          applications={applications}
          participants={participants}
          initialSessionId={initialAddSessionId}
          isSubmitting={isAddingSession}
          onSubmit={addSession}
          onClose={() => setIsAddSessionOpen(false)}
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
            {cancelTarget.type === 'PREREGISTER' && (
              <>
                <br />
                다시 신청하면 QR 문자는 오지 않고 기존 QR을 그대로 씁니다.
              </>
            )}
          </p>
          {cancelTarget.guardianNote && (
            <p
              role="alert"
              className="break-keep text-center text-body2b text-error"
            >
              {cancelTarget.guardianNote}
            </p>
          )}
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

      {declineOfferId && (
        <Dialog
          label="참여 제안 거절 확인"
          onClose={() => setDeclineOfferId(null)}
        >
          <p className="text-h3b text-black">제안을 거절할까요?</p>
          <p className="break-keep text-center text-body2r text-gray-500">
            거절하면 대기가 종료되고 다음 대기자에게 자리가 넘어갑니다. 되돌릴
            수 없습니다.
          </p>
          <div className="flex w-full gap-8">
            <button
              type="button"
              onClick={() => setDeclineOfferId(null)}
              className="flex-1 rounded-sm bg-gray-100 px-24 py-14 text-body2b text-gray-700"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={() => {
                respondOffer({ offerId: declineOfferId, action: 'decline' });
                setDeclineOfferId(null);
              }}
              className="flex-1 rounded-sm bg-error px-24 py-14 text-body2b text-white"
            >
              거절
            </button>
          </div>
        </Dialog>
      )}

      {waitlistCancelSessionId !== null && (
        <Dialog
          label="대기 신청 취소 확인"
          onClose={() => setWaitlistCancelSessionId(null)}
        >
          <p className="text-h3b text-black">대기 신청을 취소할까요?</p>
          <p className="break-keep text-center text-body2r text-gray-500">
            {preRegisterSessions.find(
              ({ id }) => id === waitlistCancelSessionId,
            )?.title ?? `회차 ${waitlistCancelSessionId}`}
            <br />이 회차에 대기 중인 일행 전체가 함께 취소되고 대기 순번이
            사라집니다. 다른 회차 신청은 그대로입니다. 다시 신청하면 새 신청으로
            맨 뒤에 접수됩니다.
          </p>
          <div className="flex w-full gap-8">
            <button
              type="button"
              onClick={() => setWaitlistCancelSessionId(null)}
              className="flex-1 rounded-sm bg-gray-100 px-24 py-14 text-body2b text-gray-700"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={() => {
                cancelWaitlist(waitlistCancelSessionId);
                setWaitlistCancelSessionId(null);
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
