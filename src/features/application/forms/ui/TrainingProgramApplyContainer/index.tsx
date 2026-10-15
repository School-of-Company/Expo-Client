'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useRef, useState } from 'react';
import { PrivacyConsent } from '@/entities/application';
import { getProgramForm } from '@/entities/form/api/programForms';
import { adaptDynamicFormToSchema } from '@/features/form/common/lib/formAdapter';
import { buildProgramApplyPayload } from '@/features/form/program';
import { FormValues as RendererFormValues } from '@/features/form/renderer/lib/visibilityEngine';
import { FormRenderer } from '@/features/form/renderer/ui';
import { SessionNotice } from '@/features/phone-verification';
import { getTrainingProgram } from '@/shared/api';
import { withLoading } from '@/shared/hocs';
import { getProgramSessionCsrfHeaders } from '@/shared/libs/http/programSessionCsrf';
import { DynamicFormValues } from '@/shared/types/application/type';
import { Button, DetailHeader } from '@/shared/ui';
import {
  ApplicationSubmitError,
  postTrainingProgramApplication,
} from '../../../api/postApplication';
import { createSubmissionKeys } from '../../../lib/createSubmissionKeys';
import {
  OUTCOME_LABEL,
  ProgramApplyOutcome,
  getProgramFormId,
  getProgramPolicyNotes,
} from '../../model/trainingProgramApply';
import { useMyApplications } from '../../model/useMyApplications';
import type { TrainingProgramItem } from '@/shared/types/program/list/type';

const ProgramApplyForm = ({
  expoId,
  program,
  formId,
  participants,
  onResult,
}: {
  expoId: string;
  program: TrainingProgramItem;
  formId: string;
  participants: { participantId: number; name: string }[];
  onResult: (outcome: ProgramApplyOutcome) => void;
}) => {
  const {
    data: form,
    error,
    refetch,
  } = useQuery({
    queryKey: ['trainingProgramForm', formId],
    queryFn: () => getProgramForm(formId),
    retry: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedId, setParticipantId] = useState<number>();
  // 참가자 목록이 폼보다 늦게 와도 첫 참가자를 기본으로 고른다
  const participantId = selectedId ?? participants[0]?.participantId;
  // 같은 내용의 재시도(연타·네트워크 오류 뒤)는 같은 Idempotency-Key 로 보낸다
  const submissionKeys = useRef(createSubmissionKeys());
  const schema = useMemo(
    () =>
      form ? adaptDynamicFormToSchema(form.dynamicForm, form.title) : null,
    [form],
  );

  const onSubmit = async (
    data: RendererFormValues & { privacyConsent?: boolean },
  ) => {
    if (participantId === undefined) {
      onResult({
        kind: 'FAILED',
        message: '신청할 참가자를 선택해주세요',
      });
      return;
    }
    if (!form || !data.privacyConsent) {
      onResult({
        kind: 'FAILED',
        message: '개인정보 제공 동의 여부를 체크해주세요',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...buildProgramApplyPayload(form, data as DynamicFormValues),
        participantId,
      };
      const result = await postTrainingProgramApplication(
        expoId,
        String(program.id),
        payload,
        await getProgramSessionCsrfHeaders(),
        submissionKeys.current.keyFor(JSON.stringify(payload)),
      );
      // PROCESSING 은 같은 키로 다시 확인해야 하므로 키를 유지한다
      if (result !== 'PROCESSING') submissionKeys.current.reset();
      onResult({ kind: result });
    } catch (submitError) {
      // 폼 버전이 바뀐 409 일 수 있으므로 최신 폼을 다시 받는다(답변은 새 버전으로 다시 보낸다)
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
            : '연수 신청에 실패했습니다',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) return <p className="text-body2r text-error">{error.message}</p>;
  if (!schema) return null;

  return (
    <FormRenderer
      schema={schema}
      onSubmit={onSubmit}
      renderFooter={(methods) => (
        <div className="mt-24 flex flex-col gap-24">
          <label className="flex flex-col gap-8 text-body2b">
            신청할 참가자
            <select
              className="rounded-sm border-1 border-solid border-gray-200 p-12 text-body2r"
              value={participantId ?? ''}
              onChange={(e) => setParticipantId(Number(e.target.value))}
            >
              {participants.map((participant) => (
                <option
                  key={participant.participantId}
                  value={participant.participantId}
                >
                  {participant.name}
                </option>
              ))}
            </select>
          </label>
          <PrivacyConsent
            content={form?.informationText ?? ''}
            watch={methods.watch}
            setValue={methods.setValue}
          />
          <Button
            type="submit"
            disabled={isSubmitting || participantId === undefined}
          >
            {isSubmitting ? '신청 중...' : `${program.title} 신청하기`}
          </Button>
        </div>
      )}
    />
  );
};

/**
 * 연수 프로그램별 신청. 프로그램마다 따로 제출하고 결과도 프로그램별로 보여 준다.
 * 여러 프로그램을 한 번에 묶어 보내지 않는다(Expo-Config-Server#71).
 */
const TrainingProgramApplyContainer = ({ expoId }: { expoId: string }) => {
  const {
    data: programs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['trainingPrograms', expoId],
    queryFn: () => getTrainingProgram(expoId),
    retry: false,
  });
  // 서버는 세션이 소유한 확정 사전등록 참가자만 프로그램 신청을 받는다
  const queryClient = useQueryClient();
  const {
    participants,
    applications,
    waitlist,
    errorMessage,
    sessionIssue,
    retry,
  } = useMyApplications(expoId);
  const eligible = participants.filter((participant) =>
    applications.some(
      (a) =>
        a.type === 'PREREGISTER' &&
        a.status === 'CONFIRMED' &&
        a.participantId === participant.participantId,
    ),
  );
  const [openId, setOpenId] = useState<number | null>(null);
  const [outcomes, setOutcomes] = useState<Record<number, ProgramApplyOutcome>>(
    {},
  );

  return withLoading({
    isLoading,
    children: (
      <div className="mt-30 flex w-full max-w-[816px] flex-col gap-24">
        <DetailHeader headerTitle="연수 신청" />
        <p className="text-body2r text-gray-500">
          신청할 연수마다 따로 신청합니다. 결과도 연수별로 표시됩니다.
        </p>
        {error && <p className="text-body2r text-error">{error.message}</p>}
        {sessionIssue && <SessionNotice expoId={expoId} issue={sessionIssue} />}
        {errorMessage && (
          <div role="alert" className="flex flex-col gap-8">
            <p className="text-body2r text-error">{errorMessage}</p>
            <button
              type="button"
              onClick={() => retry()}
              className="self-start rounded-sm border-1 border-solid border-main-600 px-16 py-8 text-caption1b text-main-600"
            >
              다시 시도
            </button>
          </div>
        )}
        {!errorMessage && !sessionIssue && eligible.length === 0 && (
          <p className="break-keep text-body2r text-gray-600">
            {waitlist
              ? '사전등록이 대기 중입니다. 확정된 뒤에 연수를 신청할 수 있습니다.'
              : '사전등록이 확정된 참가자만 연수를 신청할 수 있습니다. 먼저 사전등록과 본인 인증을 완료해주세요.'}
          </p>
        )}
        {programs?.map((program) => {
          const formId = getProgramFormId(program);
          const outcome = outcomes[program.id];
          return (
            <section
              key={program.id}
              className="flex flex-col gap-16 rounded-sm border-1 border-solid border-gray-200 p-24"
            >
              <div className="flex items-center justify-between gap-16">
                <p className="text-body1b">{program.title}</p>
                <Button
                  type="button"
                  disabled={!formId}
                  onClick={() =>
                    setOpenId(openId === program.id ? null : program.id)
                  }
                >
                  {openId === program.id ? '닫기' : '신청'}
                </Button>
              </div>
              {program.policy && (
                <ul className="flex flex-col gap-4 text-caption1r text-gray-600">
                  {getProgramPolicyNotes(program.policy).map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                  <li className="text-gray-500">
                    안내된 정원·기간은 참고용이며, 신청할 때 서버가 자격과 남은
                    자리를 다시 확인합니다.
                  </li>
                </ul>
              )}
              {!formId && (
                <p className="text-caption1r text-gray-500">
                  이 연수는 아직 온라인 신청서가 연결되지 않았습니다.
                </p>
              )}
              {outcome && (
                <p
                  role="status"
                  className={`text-body2b ${outcome.kind === 'FAILED' ? 'text-error' : 'text-main-600'}`}
                >
                  {outcome.kind === 'FAILED'
                    ? outcome.message
                    : OUTCOME_LABEL[outcome.kind]}
                </p>
              )}
              {formId && openId === program.id && (
                <ProgramApplyForm
                  expoId={expoId}
                  program={program}
                  formId={formId}
                  participants={eligible}
                  onResult={(next) => {
                    setOutcomes((prev) => ({ ...prev, [program.id]: next }));
                    // 접수·거절 모두 내 신청·취소 가능 여부가 바뀔 수 있어 다시 받는다
                    queryClient.invalidateQueries({
                      queryKey: ['myApplications', expoId],
                    });
                  }}
                />
              )}
            </section>
          );
        })}
      </div>
    ),
  });
};

export default TrainingProgramApplyContainer;
