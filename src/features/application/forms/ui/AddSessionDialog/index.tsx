'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  SessionIssue,
  SessionNotice,
  getSessionIssue,
} from '@/features/phone-verification';
import {
  OCCUPATION_LABEL,
  formatDefinitionSchedule,
} from '@/features/registration/common/model/ledger';
import { ApiError } from '@/shared/libs/http/apiError';
import { useModalDialog } from '@/shared/model';
import { createSubmissionKeys } from '../../../lib/createSubmissionKeys';
import {
  PARTICIPANT_BLOCK_LABEL,
  SESSION_BLOCK_LABEL,
  getParticipantBlockReason,
  getSessionBlockReason,
  isCurrentParticipant,
} from '../../model/addSession';
import type {
  AddSessionResult,
  OwnerApplication,
  OwnerParticipant,
} from '../../api/myApplications';
import type { PublicPreregisterSession } from '../../api/preRegister';

const RESULT_MESSAGE: Record<
  AddSessionResult['status'],
  (result: AddSessionResult) => string
> = {
  CONFIRMED: () =>
    '회차를 추가했습니다. 기존 QR을 그대로 쓰며 문자는 오지 않습니다.',
  WAITING: ({ position }) =>
    `자리가 모자라 대기로 접수되었습니다${position ? `(대기 ${position}번)` : ''}. 자리가 나면 확정됩니다.`,
  PROCESSING: () =>
    '회차 추가를 처리하고 있습니다. 잠시 후 신청 현황을 다시 확인해주세요.',
};

/**
 * 이미 사전등록한 일행의 다른 회차를 더한다. 답변은 처음 신청한 것을 서버가 다시 쓰고,
 * 여기서는 회차와 참석자만 고른다. 정원·기간·시간 겹침의 최종 판정은 서버가 한다
 */
const AddSessionDialog = ({
  expoId,
  sessions,
  applications,
  participants,
  initialSessionId,
  isSubmitting,
  onSubmit,
  onClose,
}: {
  expoId: string;
  sessions: PublicPreregisterSession[];
  applications: OwnerApplication[];
  participants: OwnerParticipant[];
  /** 다른 화면에서 회차를 골라 들어오면 미리 선택해 둔다 */
  initialSessionId?: number;
  isSubmitting: boolean;
  onSubmit: (body: {
    sessionId: number;
    participantIds: number[];
    idempotencyKey: string;
  }) => Promise<AddSessionResult>;
  onClose: () => void;
}) => {
  const dialogRef = useModalDialog({ onClose });
  // 모두 취소한 동행자는 내 신청 목록에서 숨기므로 회차 추가 대상에서도 뺀다.
  // 회차 활성화 판정·기본 선택·선택 인원·제출 대상이 모두 이 집합을 쓴다
  const current = participants.filter(({ participantId }) =>
    isCurrentParticipant(applications, participantId),
  );
  const participantIds = current.map(({ participantId }) => participantId);
  const blockOf = (session: PublicPreregisterSession) =>
    getSessionBlockReason(session, sessions, applications, participantIds);
  const initial = sessions.find(
    (session) => session.id === initialSessionId && !blockOf(session),
  );
  const [sessionId, setSessionId] = useState<number | undefined>(initial?.id);
  // 기본은 지금 일행 전체
  const [selectedIds, setSelectedIds] = useState<number[]>(participantIds);
  const submissionKeys = useRef(createSubmissionKeys());
  const [errorMessage, setErrorMessage] = useState<string>();
  const [formChanged, setFormChanged] = useState(false);
  const [sessionIssue, setSessionIssue] = useState<SessionIssue>();

  const selectedSession = sessions.find(({ id }) => id === sessionId);
  // 고른 회차에 이미 신청했거나 시간이 겹치는 참석자는 빼고 보낸다
  const participantBlockOf = (participantId: number) =>
    selectedSession
      ? getParticipantBlockReason(
          selectedSession,
          sessions,
          applications,
          participantId,
        )
      : null;
  // 취소로 일행에서 빠진 사람의 오래된 선택 ID가 남아 있어도 보내지 않는다
  const addableIds = selectedIds.filter(
    (id) => participantIds.includes(id) && !participantBlockOf(id),
  );
  const canSubmit =
    sessionId !== undefined && addableIds.length > 0 && !isSubmitting;

  const toggle = (participantId: number) =>
    setSelectedIds((prev) =>
      prev.includes(participantId)
        ? prev.filter((id) => id !== participantId)
        : [...prev, participantId],
    );

  const renderParticipant = ({
    participantId,
    name,
    occupation,
    representative,
  }: OwnerParticipant) => {
    const block = participantBlockOf(participantId);
    return (
      <label
        key={participantId}
        className={`flex items-center gap-8 text-body2r ${
          block ? 'cursor-not-allowed text-gray-400' : 'text-black'
        }`}
      >
        <input
          type="checkbox"
          checked={!block && selectedIds.includes(participantId)}
          disabled={!!block}
          onChange={() => toggle(participantId)}
        />
        {name}
        <span className="text-caption1r text-gray-500">
          {representative ? '대표자' : '일행'}
          {occupation && ` · ${OCCUPATION_LABEL[occupation] ?? occupation}`}
        </span>
        {block && (
          <span className="text-caption1r">
            ({PARTICIPANT_BLOCK_LABEL[block]})
          </span>
        )}
      </label>
    );
  };

  const submit = async () => {
    if (sessionId === undefined || !canSubmit) return;
    setErrorMessage(undefined);
    setFormChanged(false);
    setSessionIssue(undefined);
    const participantIds = [...addableIds].sort((a, b) => a - b);
    try {
      const result = await onSubmit({
        sessionId,
        participantIds,
        idempotencyKey: submissionKeys.current.keyFor(
          JSON.stringify({ sessionId, participantIds }),
        ),
      });
      const message = RESULT_MESSAGE[result.status](result);
      if (result.status === 'CONFIRMED') toast.success(message);
      else toast.info(message);
      onClose();
    } catch (error) {
      setSessionIssue(getSessionIssue(error));
      // 신청 뒤 사전등록 폼이 바뀌면 답변을 다시 쓸 수 없어 처음 신청부터 다시 해야 한다
      setFormChanged(
        error instanceof ApiError && error.code === 'FORM_CHANGED',
      );
      setErrorMessage((error as Error).message);
    }
  };

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
        aria-label="다른 회차 추가"
        tabIndex={-1}
        className="flex max-h-[90vh] w-full max-w-[480px] flex-col gap-16 overflow-y-auto rounded-sm bg-white p-24 outline-none mobile:p-18"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-4">
          <p className="text-h3b text-black">다른 회차 추가</p>
          <p className="break-keep text-body2r text-gray-500">
            이미 신청한 내용으로 다른 회차에도 사전등록합니다. 답변은 다시 쓰지
            않고, 회차와 참석자만 고릅니다.
          </p>
        </div>

        <fieldset className="flex flex-col gap-8">
          <legend className="mb-8 text-body2b text-black">회차 선택</legend>
          {sessions.length === 0 && (
            <p className="text-body2r text-gray-500">
              추가할 수 있는 회차가 없습니다.
            </p>
          )}
          {sessions.map((session) => {
            const block = blockOf(session);
            const checked = sessionId === session.id;
            return (
              <label
                key={session.id}
                className={`flex flex-col gap-2 rounded-sm border-1 border-solid px-16 py-12 ${
                  block
                    ? 'cursor-not-allowed border-gray-100 bg-gray-100 text-gray-400'
                    : checked
                      ? 'cursor-pointer border-main-600 bg-main-100'
                      : 'cursor-pointer border-gray-200 bg-white'
                }`}
              >
                <span className="flex items-center gap-8">
                  <input
                    type="radio"
                    name="add-session"
                    checked={checked}
                    disabled={!!block}
                    onChange={() => setSessionId(session.id)}
                  />
                  <span className="text-body2b">{session.title}</span>
                  {block && (
                    <span className="text-caption1r">
                      ({SESSION_BLOCK_LABEL[block]})
                    </span>
                  )}
                </span>
                <span className="pl-24 text-caption1r">
                  {formatDefinitionSchedule(session.startedAt, session.endedAt)}
                </span>
              </label>
            );
          })}
        </fieldset>

        <fieldset className="flex flex-col gap-8">
          <legend className="mb-8 text-body2b text-black">
            참석자 선택 · 일행 {current.length}명
          </legend>
          {current.map(renderParticipant)}
          <p className="break-keep text-caption1r text-gray-500">
            대표자는 이 회차에 참석하지 않아도 됩니다.
          </p>
        </fieldset>

        {sessionIssue ? (
          <SessionNotice expoId={expoId} issue={sessionIssue} />
        ) : (
          errorMessage && (
            <div role="alert" className="flex flex-col gap-8">
              <p className="break-keep text-body2r text-error">
                {formChanged
                  ? '신청한 뒤 사전등록 폼이 바뀌어 이 회차를 바로 추가할 수 없습니다. 처음 신청부터 다시 해주세요.'
                  : errorMessage}
              </p>
              {formChanged && (
                <Link
                  href={`/application/forms/${expoId}/pre-register`}
                  className="self-start text-body2b text-main-600 underline"
                >
                  사전등록 다시 하기
                </Link>
              )}
            </div>
          )
        )}

        <p className="break-keep text-caption1r text-gray-500">
          남은 자리는 추가할 때 서버가 다시 확인합니다. 자리가 모자라면 대기로
          접수될 수 있습니다.
        </p>

        <div className="flex w-full gap-8">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-sm bg-gray-100 px-24 py-14 text-body2b text-gray-700"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="flex-1 rounded-sm bg-main-600 px-24 py-14 text-body2b text-white disabled:bg-main-300"
          >
            {isSubmitting ? '추가 중...' : '회차 추가'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSessionDialog;
