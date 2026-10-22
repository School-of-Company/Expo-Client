'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  CompanionField,
  getOccupationLabels,
  OccupationLabelsProvider,
} from '@/entities/form';
import {
  SessionIssue,
  SessionNotice,
  getSessionIssue,
} from '@/features/phone-verification';
import { getExpoRoutes } from '@/shared/config';
import { createSubmissionKeys } from '../../../lib/createSubmissionKeys';
import { processCompanions } from '../../../lib/process/processFormField';
import {
  FIELD_VISIT_STATE_LABEL,
  MAX_PARTY_SIZE,
  getFieldVisitState,
  getOutcomeLabel,
  getRemainingNewSlots,
  isSelectable,
} from '../../model/fieldVisits';
import { useRegisterFieldVisits } from '../../model/useFieldVisits';
import type {
  FieldVisitParty,
  FieldVisitReceipt,
  NewFieldParticipant,
} from '../../api/fieldVisits';
import type {
  DynamicFormItem,
  Companion,
} from '@/shared/types/application/type';

const formatVisitDate = (visitDate: string) => {
  const [year, month, day] = visitDate.split('-').map(Number);
  return year && month && day ? `${year}.${month}.${day}` : visitDate;
};

const toNewParticipant = (
  companion: Companion,
  clientReference: string,
): NewFieldParticipant => ({
  clientReference,
  name: companion.name,
  occupation: companion.occupation,
  region: companion.region,
  ...(companion.school && { school: companion.school }),
});

/**
 * 인증한 번호의 기존 일행을 참가자별 오늘 방문일 상태와 함께 보여 주고, 오늘 현장등록을 추가한다.
 * 이름·유형·학교는 다시 입력하지 않고 기존 참가자 프로필·QR 도 바꾸지 않는다. 새 동행자는 따로 추가한다
 */
const FieldVisitRegistration = ({
  expoId,
  party,
  isRefreshing,
  dynamicForm,
}: {
  expoId: string;
  party: FieldVisitParty;
  isRefreshing: boolean;
  dynamicForm?: DynamicFormItem[];
}) => {
  const { mutateAsync, isPending } = useRegisterFieldVisits(expoId);
  const { control, register, handleSubmit, reset } = useForm<FieldValues>({
    defaultValues: { companions: [] },
  });
  const [selected, setSelected] = useState<number[]>([]);
  const [addingCompanion, setAddingCompanion] = useState(false);
  const [receipt, setReceipt] = useState<FieldVisitReceipt>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [sessionIssue, setSessionIssue] = useState<SessionIssue>();
  // 같은 내용의 재제출(연타·네트워크 오류 뒤 재시도)은 같은 키로, 성공 뒤에는 새 키로 보낸다
  const submissionKeys = useRef(createSubmissionKeys());
  // 신규 동행자는 서버가 결과를 돌려줄 때 짝을 맞추는 참조값이 필요하다. 같은 제출에서는 같은 값을 쓴다
  const references = useRef<string[]>([]);
  // 결과의 신규 동행자는 참조값으로 이름을 찾는다
  const newNames = useRef(new Map<string, string>());

  const remainingSlots = getRemainingNewSlots(party.participants);
  const selectableIds = new Set(
    party.participants
      .filter(isSelectable)
      .map(({ participantId }) => participantId),
  );
  const nameById = new Map(
    party.participants.map(({ participantId, name }) => [participantId, name]),
  );

  const toggle = (participantId: number) =>
    setSelected((current) =>
      current.includes(participantId)
        ? current.filter((id) => id !== participantId)
        : [...current, participantId],
    );

  const submit = handleSubmit(async (values) => {
    const companions = addingCompanion
      ? processCompanions(values.companions)
      : [];
    const participantIds = selected.filter((id) => selectableIds.has(id));
    if (participantIds.length + companions.length === 0) {
      setErrorMessage('등록할 참가자를 선택하거나 새 동행자를 입력해주세요.');
      return;
    }
    while (references.current.length < companions.length)
      references.current.push(crypto.randomUUID());
    const newParticipants = companions.map((companion, index) =>
      toNewParticipant(companion, references.current[index]),
    );
    setErrorMessage(undefined);
    setSessionIssue(undefined);
    try {
      const result = await mutateAsync({
        body: { participantIds, newParticipants },
        idempotencyKey: submissionKeys.current.keyFor(
          JSON.stringify({ participantIds, newParticipants }),
        ),
        csrfToken: party.csrfToken,
      });
      companions.forEach(({ name }, index) =>
        newNames.current.set(references.current[index], name),
      );
      setReceipt(result);
      toast.success('오늘 현장등록을 처리했습니다.');
      submissionKeys.current.reset();
      references.current = [];
      setSelected([]);
      setAddingCompanion(false);
      reset({ companions: [] });
    } catch (error) {
      setSessionIssue(getSessionIssue(error));
      setErrorMessage((error as Error).message);
    }
  });

  return (
    <div className="flex flex-col gap-24">
      <p className="break-keep text-body2r text-gray-600">
        {formatVisitDate(party.visitDate)} 방문 등록입니다. 이미 등록한 분은
        다시 만들지 않고, 오늘 등록이 없는 분만 선택해 추가할 수 있습니다.
        이름·유형·학교는 바뀌지 않습니다.
      </p>

      {receipt && (
        <div
          role="status"
          className="flex flex-col gap-8 rounded-sm border-1 border-solid border-main-600 bg-white p-24"
        >
          <p className="text-body2b text-gray-900">
            {formatVisitDate(receipt.visitDate)} 현장등록 결과
          </p>
          <ul className="flex flex-col gap-4 text-body2r text-gray-700">
            {receipt.participants.map(
              ({ participantId, clientReference, outcome }) => (
                <li key={participantId}>
                  {nameById.get(participantId) ??
                    (clientReference &&
                      newNames.current.get(clientReference)) ??
                    `참가자 ${participantId}`}
                  : {getOutcomeLabel(outcome)}
                </li>
              ),
            )}
          </ul>
          <Link
            href={getExpoRoutes(expoId).applicationMy}
            className="self-start text-body2b text-main-600 underline"
          >
            내 신청·QR 보기
          </Link>
        </div>
      )}

      <ul className="flex flex-col gap-8" aria-label="기존 일행">
        {party.participants.map((participant) => {
          const state = getFieldVisitState(participant);
          const selectable = isSelectable(participant);
          return (
            <li
              key={participant.participantId}
              className="flex items-start gap-12 rounded-sm border-1 border-solid border-gray-200 bg-white p-16"
            >
              <input
                id={`field-visit-${participant.participantId}`}
                type="checkbox"
                className="mt-4 h-20 w-20"
                disabled={!selectable || isPending}
                checked={selected.includes(participant.participantId)}
                onChange={() => toggle(participant.participantId)}
              />
              <label
                htmlFor={`field-visit-${participant.participantId}`}
                className="flex flex-1 flex-col gap-4"
              >
                <span className="text-body2b text-gray-900">
                  {participant.name}
                  {participant.representative && (
                    <span className="ml-8 text-caption1r text-gray-500">
                      대표자
                    </span>
                  )}
                </span>
                <span
                  className={`text-body2r ${selectable ? 'text-gray-600' : 'text-main-600'}`}
                >
                  {FIELD_VISIT_STATE_LABEL[state]}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <form onSubmit={submit} className="flex flex-col gap-16">
        <div className="flex flex-col gap-8">
          <button
            type="button"
            disabled={remainingSlots === 0 || isPending}
            aria-expanded={addingCompanion}
            onClick={() => setAddingCompanion((open) => !open)}
            className="self-start text-body2b text-main-600 underline disabled:text-gray-400 disabled:no-underline"
          >
            {addingCompanion ? '새 동행자 추가 닫기' : '새 동행자 추가'}
          </button>
          <p className="break-keep text-caption1r text-gray-500">
            현재 일행 {party.participants.length}명 · 새 동행자 {remainingSlots}
            명까지 추가할 수 있습니다(대표자 포함 최대 {MAX_PARTY_SIZE}명). 기존
            일행은 5명이어도 선택해 등록할 수 있습니다.
          </p>
        </div>

        {addingCompanion && remainingSlots > 0 && (
          <OccupationLabelsProvider value={getOccupationLabels(dynamicForm)}>
            <CompanionField
              name="companions"
              label="새 동행자"
              required
              maxCount={remainingSlots}
              limitHint={`새 동행자는 ${remainingSlots}명까지 추가할 수 있습니다.`}
              control={control}
              register={register}
            />
          </OccupationLabelsProvider>
        )}

        {sessionIssue ? (
          <SessionNotice expoId={expoId} issue={sessionIssue} />
        ) : (
          errorMessage && (
            <p role="alert" className="break-keep text-body2r text-error">
              {errorMessage}
            </p>
          )
        )}

        <button
          type="submit"
          disabled={isPending || isRefreshing}
          className="rounded-sm bg-main-600 px-24 py-14 text-body2b text-white disabled:bg-main-300"
        >
          {isPending ? '등록 중...' : '오늘 현장등록 추가'}
        </button>
      </form>
    </div>
  );
};

export default FieldVisitRegistration;
