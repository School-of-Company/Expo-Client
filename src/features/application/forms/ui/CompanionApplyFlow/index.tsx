'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useRef, useState } from 'react';
import { PrivacyConsent } from '@/entities/application';
import { getProgramForm } from '@/entities/form/api/programForms';
import { adaptDynamicFormToSchema } from '@/features/form/common/lib/formAdapter';
import { buildProgramApplyPayload } from '@/features/form/program';
import { FormValues } from '@/features/form/renderer/lib/visibilityEngine';
import { FormRenderer } from '@/features/form/renderer/ui';
import { getProgramSessionCsrfHeaders } from '@/shared/libs/http/programSessionCsrf';
import { DynamicFormValues } from '@/shared/types/application/type';
import { Button } from '@/shared/ui';
import {
  ApplicationSubmitError,
  postProgramApplication,
  postProgramBatchApplication,
} from '../../../api/postApplication';
import { createSubmissionKeys } from '../../../lib/createSubmissionKeys';
import {
  CompanionCandidate,
  buildBatchRequest,
  buildSteps,
  findReusedGuardian,
  isGuardian,
  isLowGrade,
  moveStep,
  validateSelection,
} from '../../model/companionSteps';
import { ProgramApplyOutcome } from '../../model/programApply';
import type { Program, ProgramType } from '@/shared/types/program/list/type';

type Candidate = CompanionCandidate & { eligible: boolean };

// 신청 가능한 참가자이거나, 이 회차에 이미 신청해 재사용할 보호자
const isSelectable = (p: Candidate) => p.eligible || !!p.guardianApplied;

/**
 * 동반 필수 프로그램 신청. 학생·보호자를 고르고 사람별 폼을 한 명씩 작성한 뒤 마지막에 한 번에 제출한다.
 * 다음·이전은 화면 안의 이동일 뿐 신청·좌석 확보 API 를 호출하지 않는다.
 * 답변은 참가자 id 로 보관해, 사람이 바뀌어도 다른 사람에게 적용되지 않는다.
 */
const CompanionApplyFlow = ({
  expoId,
  programType,
  program,
  formId,
  participants,
  onsite,
  onResult,
}: {
  expoId: string;
  programType: ProgramType;
  program: Program;
  formId: string;
  participants: Candidate[];
  onsite: boolean;
  onResult: (outcome: ProgramApplyOutcome) => void;
}) => {
  const {
    data: form,
    error,
    refetch,
  } = useQuery({
    queryKey: ['programForm', formId],
    queryFn: () => getProgramForm(formId),
    retry: false,
  });
  const schema = useMemo(
    () =>
      form ? adaptDynamicFormToSchema(form.dynamicForm, form.title) : null,
    [form],
  );
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // null 이면 대상 선택 단계, 숫자면 steps 의 그 사람 폼
  const [step, setStep] = useState<number | null>(null);
  const [values, setValues] = useState<Record<number, FormValues>>({});
  const [message, setMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inFlight = useRef(false);
  const submissionKeys = useRef(createSubmissionKeys());

  const selected = selectedIds.flatMap((id) => {
    const found = participants.find(
      (p) => p.participantId === id && isSelectable(p),
    );
    return found ? [found] : [];
  });
  const steps = buildSteps(selected);
  const reusedGuardian = findReusedGuardian(selected);
  const current = step === null ? undefined : steps[step];

  const toggle = (id: number) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const start = () => {
    const problem = validateSelection(selected);
    if (problem) return setMessage(problem);
    setMessage(undefined);
    setStep(0);
  };

  const submitAll = async (last: FormValues) => {
    if (!form || !current) return;
    if (!(last as { privacyConsent?: boolean }).privacyConsent) {
      setMessage('개인정보 제공 동의 여부를 체크해주세요');
      return;
    }
    const all = { ...values, [current.participantId]: last };
    // 최종 전체 검증: 선택이 그대로 유효하고 모든 사람의 답변이 있어야 한다
    const problem = validateSelection(selected);
    if (problem || steps.some((p) => !all[p.participantId])) {
      setMessage(
        problem ?? '작성하지 않은 사람이 있습니다. 처음부터 확인해주세요.',
      );
      return;
    }
    if (inFlight.current) return;
    inFlight.current = true;
    setIsSubmitting(true);
    setMessage(undefined);
    try {
      const guardianPolicy = program.policy?.guardianPolicy;
      const answersById = Object.fromEntries(
        steps.map((p) => [
          p.participantId,
          buildProgramApplyPayload(
            form,
            all[p.participantId] as DynamicFormValues,
          ).answers,
        ]),
      );
      const hasGuardian = selected.some(isGuardian);
      // 초등 1~3학년은 보호자와 함께 신청해야 한다. 최종 판정은 서버가 하지만 보내기 전에 안내한다
      if (
        !hasGuardian &&
        guardianPolicy &&
        steps.some((p) =>
          isLowGrade(
            guardianPolicy,
            (answersById[p.participantId] ?? {}) as Record<string, unknown>,
          ),
        )
      ) {
        setMessage(
          '초등 1~3학년 학생은 보호자와 함께 신청해야 합니다. 처음 단계로 돌아가 보호자를 선택해주세요.',
        );
        return;
      }
      const csrfHeaders = await getProgramSessionCsrfHeaders();
      // 보호자 없는 학생 한 명은 기존 단건 신청이다(서버가 저학년 단독 신청을 막는다)
      const single = hasGuardian ? null : steps[0];
      const payload = single
        ? {
            participantId: single.participantId,
            formVersion: form.version,
            answers: answersById[single.participantId],
          }
        : buildBatchRequest(selected, form.version, answersById);
      const key = submissionKeys.current.keyFor(JSON.stringify(payload));
      const result = single
        ? await postProgramApplication(
            programType,
            expoId,
            String(program.id),
            payload,
            csrfHeaders,
            key,
            onsite,
          )
        : await postProgramBatchApplication(
            programType,
            expoId,
            String(program.id),
            payload as ReturnType<typeof buildBatchRequest>,
            csrfHeaders,
            key,
            onsite,
          );
      const status = typeof result === 'string' ? result : result.status;
      // PROCESSING 은 같은 키로 다시 확인해야 하므로 답변과 키를 유지한다
      if (status === 'PROCESSING') {
        onResult({ kind: 'PROCESSING' });
        return;
      }
      submissionKeys.current.reset();
      onResult({
        kind: status,
        reusedGuardian:
          typeof result !== 'string' && result.reusedParticipantIds.length > 0,
      });
      setValues({});
      setSelectedIds([]);
      setStep(null);
    } catch (submitError) {
      // 폼 버전이 바뀐 409 일 수 있으므로 최신 폼을 다시 받는다. 답변은 보존한다
      if (
        submitError instanceof ApplicationSubmitError &&
        submitError.status === 409
      )
        refetch();
      onResult({
        kind: 'FAILED',
        message:
          submitError instanceof Error
            ? submitError.message
            : '신청에 실패했습니다',
      });
    } finally {
      inFlight.current = false;
      setIsSubmitting(false);
    }
  };

  if (error) return <p className="text-body2r text-error">{error.message}</p>;
  if (!schema) return null;

  if (step === null || !current)
    return (
      <div className="flex flex-col gap-16">
        <fieldset className="flex flex-col gap-8">
          <legend className="mb-8 text-body2b">신청할 학생·보호자</legend>
          <p className="break-keep text-caption1r text-gray-600">
            학생을 고르고 보호자 한 명을 함께 선택합니다. 보호자만 단독으로
            신청할 수 없고, 여러 학생이 같은 보호자를 선택할 수 있습니다.
            보호자의 자리도 한 석 사용합니다.
          </p>
          {participants.map((p) => (
            <label
              key={p.participantId}
              className="flex flex-wrap items-center gap-8 text-body2r"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(p.participantId)}
                disabled={!isSelectable(p)}
                onChange={() => toggle(p.participantId)}
              />
              {p.name}
              <span className="text-caption1r text-gray-500">
                {isGuardian(p) ? '(보호자)' : '(학생)'}
              </span>
              {p.guardianApplied && (
                <span className="text-caption1r text-main-600">
                  이 회차에 이미 신청해 기존 신청을 재사용합니다. 폼을 다시
                  받거나 좌석을 추가하지 않습니다.
                </span>
              )}
              {!isSelectable(p) && (
                <span className="text-caption1r text-gray-500">
                  (신청할 수 없는 참가자)
                </span>
              )}
            </label>
          ))}
        </fieldset>
        {message && (
          <p role="alert" className="text-body2r text-error">
            {message}
          </p>
        )}
        <Button type="button" onClick={start}>
          다음
        </Button>
      </div>
    );

  const isLast = step === steps.length - 1;
  return (
    <div className="flex flex-col gap-16">
      <p role="status" className="text-body1b text-main-600">
        {current.name}님의 신청서 ({step + 1}/{steps.length}){' '}
        {isGuardian(current) ? '· 보호자' : '· 학생'}
      </p>
      {reusedGuardian && (
        <p className="break-keep text-caption1r text-gray-600">
          보호자 {reusedGuardian.name}님은 기존 신청을 재사용합니다.
        </p>
      )}
      <FormRenderer
        // 사람마다 폼 상태를 따로 둔다. 다른 사람의 답변이 섞이지 않는다
        key={current.participantId}
        schema={schema}
        defaultValues={values[current.participantId]}
        onSubmit={(data) => {
          if (isLast) return submitAll(data);
          setValues((prev) => ({ ...prev, [current.participantId]: data }));
          setMessage(undefined);
          setStep((s) => moveStep(s ?? 0, 1, steps.length));
        }}
        renderFooter={(methods) => (
          <div className="mt-24 flex flex-col gap-24">
            {isLast && (
              <PrivacyConsent
                content={form?.informationText ?? ''}
                watch={methods.watch}
                setValue={methods.setValue}
              />
            )}
            {message && (
              <p role="alert" className="text-body2r text-error">
                {message}
              </p>
            )}
            <div className="flex gap-8">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  // 이동 시 작성값을 유지한다. 앞으로 다시 갈 때 검증한다
                  setValues((prev) => ({
                    ...prev,
                    [current.participantId]: methods.getValues(),
                  }));
                  if (step === 0) setStep(null);
                  else setStep((s) => moveStep(s ?? 0, -1, steps.length));
                }}
                className="flex-1 rounded-sm bg-gray-100 px-24 py-14 text-body2b text-gray-700"
              >
                이전
              </button>
              <div className="flex-1">
                <Button type="submit" disabled={isSubmitting}>
                  {isLast
                    ? isSubmitting
                      ? '신청 중...'
                      : `${program.title} 전체 제출`
                    : '다음'}
                </Button>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default CompanionApplyFlow;
