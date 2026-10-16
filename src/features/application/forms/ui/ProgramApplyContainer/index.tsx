'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { PrivacyConsent } from '@/entities/application';
import { getProgramForm } from '@/entities/form/api/programForms';
import { adaptDynamicFormToSchema } from '@/features/form/common/lib/formAdapter';
import { buildProgramApplyPayload } from '@/features/form/program';
import { FormValues as RendererFormValues } from '@/features/form/renderer/lib/visibilityEngine';
import { FormRenderer } from '@/features/form/renderer/ui';
import { getPublicStandardProgram, getTrainingProgram } from '@/shared/api';
import { withLoading } from '@/shared/hocs';
import { getProgramSessionCsrfHeaders } from '@/shared/libs/http/programSessionCsrf';
import { DynamicFormValues } from '@/shared/types/application/type';
import { Button, DetailHeader } from '@/shared/ui';
import {
  ApplicationSubmitError,
  postProgramApplication,
} from '../../../api/postApplication';
import { createSubmissionKeys } from '../../../lib/createSubmissionKeys';
import { getProgramParticipants } from '../../api/programParticipants';
import { formatFormPeriod } from '../../model/formPeriodStatus';
import {
  OUTCOME_LABEL,
  ProgramApplyOutcome,
  getProgramFormId,
  getProgramPolicyNotes,
} from '../../model/programApply';
import { getGroupApplications, groupPrograms } from '../../model/programGroups';
import { useMyApplications } from '../../model/useMyApplications';
import type { Program, ProgramType } from '@/shared/types/program/list/type';

const PROGRAM_LABEL: Record<ProgramType, string> = {
  STANDARD: '프로그램',
  TRAINING: '연수',
};

const ProgramApplyForm = ({
  expoId,
  programType,
  program,
  formId,
  participants,
  onResult,
}: {
  expoId: string;
  programType: ProgramType;
  program: Program;
  formId: string;
  // 서버가 알려 준 이 프로그램의 참가자. 신청 불가(eligible=false)는 선택할 수 없다
  participants: { participantId: number; name: string; eligible: boolean }[];
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 연타가 state 갱신 전에 두 번 들어오지 않게 막는다
  const inFlight = useRef(false);
  const [selectedId, setParticipantId] = useState<number>();
  // 다시 받은 목록에서 빠진 참가자를 고른 채로 두지 않고 첫 참가자를 기본으로 고른다
  const eligible = participants.filter((p) => p.eligible);
  const participantId = eligible.some((p) => p.participantId === selectedId)
    ? selectedId
    : eligible[0]?.participantId;
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
    if (inFlight.current) return;
    inFlight.current = true;
    setIsSubmitting(true);
    try {
      const payload = {
        ...buildProgramApplyPayload(form, data as DynamicFormValues),
        participantId,
      };
      const result = await postProgramApplication(
        programType,
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
            : `${PROGRAM_LABEL[programType]} 신청에 실패했습니다`,
      });
    } finally {
      inFlight.current = false;
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
          <fieldset className="flex flex-col gap-8">
            <legend className="mb-8 text-body2b">신청할 참가자</legend>
            {participants.map((participant) => (
              <label
                key={participant.participantId}
                className="flex items-center gap-8 text-body2r"
              >
                <input
                  type="radio"
                  name={`participant-${program.id}`}
                  checked={participantId === participant.participantId}
                  disabled={!participant.eligible}
                  onChange={() => setParticipantId(participant.participantId)}
                />
                {participant.name}
                {!participant.eligible && (
                  <span className="text-caption1r text-gray-500">
                    (신청할 수 없는 참가자)
                  </span>
                )}
              </label>
            ))}
          </fieldset>
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

// 신청 가능한 참가자는 서버가 프로그램별로 판단한다. 조회 실패·미등록·대상 없음을 구분해 안내한다
const ParticipantLookup = ({
  expoId,
  programType,
  program,
  formId,
  waiting,
  onResult,
}: {
  expoId: string;
  programType: ProgramType;
  program: Program;
  formId: string;
  waiting: boolean;
  onResult: (outcome: ProgramApplyOutcome) => void;
}) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ['programParticipants', expoId, programType, program.id],
    queryFn: () => getProgramParticipants(expoId, programType, program.id),
    retry: false,
    meta: { silent: true },
  });

  if (isLoading)
    return (
      <p role="status" className="text-body2r text-gray-500">
        신청 가능한 참가자를 확인하는 중입니다...
      </p>
    );
  if (error) return <p className="text-body2r text-error">{error.message}</p>;
  if (!data) return null;
  if (!data.registered)
    return (
      <p className="break-keep text-body2r text-gray-600">
        {waiting
          ? '사전등록이 대기 중입니다. 확정된 뒤에 신청할 수 있습니다.'
          : '사전등록이 확정된 참가자만 신청할 수 있습니다. '}
        {!waiting && (
          <Link
            href={`/application/forms/${expoId}/pre-register`}
            className="text-main-600 underline"
          >
            사전등록하러 가기
          </Link>
        )}
      </p>
    );
  const members = data.participants.map(({ participant, eligible }) => ({
    participantId: participant.participantId,
    name: participant.name,
    eligible,
  }));
  if (!members.some((m) => m.eligible))
    return (
      <p className="break-keep text-body2r text-gray-600">
        이 프로그램을 신청할 수 있는 참가자가 없습니다. 직업·정원·신청 기간 또는
        이미 신청한 같은 묶음 프로그램을 확인해주세요.
      </p>
    );
  return (
    <ProgramApplyForm
      expoId={expoId}
      programType={programType}
      program={program}
      formId={formId}
      participants={members}
      onResult={onResult}
    />
  );
};

/**
 * 프로그램별 신청(일반·연수 공통). 프로그램마다 따로 제출하고 결과도 프로그램별로 보여 준다.
 * 여러 프로그램을 한 번에 묶어 보내지 않는다(Expo-Config-Server#71).
 */
const ProgramApplyContainer = ({
  expoId,
  programType,
}: {
  expoId: string;
  programType: ProgramType;
}) => {
  const label = PROGRAM_LABEL[programType];
  const {
    data: programs,
    isLoading,
    error,
  } = useQuery<Program[]>({
    queryKey: ['applyPrograms', programType, expoId],
    queryFn: () =>
      programType === 'TRAINING'
        ? getTrainingProgram(expoId)
        : getPublicStandardProgram(expoId),
    retry: false,
  });
  const queryClient = useQueryClient();
  // 사전등록 대기 중인 일행이 있으면 "미등록" 대신 대기 안내를 보여 준다
  const { waitlist, applications, participants } = useMyApplications(expoId);
  const groups = useMemo(() => groupPrograms(programs ?? []), [programs]);
  // 묶음별로 고른 회차와 신청서를 연 묶음. 회차를 바꾸면 신청서를 닫아 이전 회차의 선택·답변이 남지 않게 한다
  const [selectedByGroup, setSelectedByGroup] = useState<
    Record<string, number>
  >({});
  const [openGroupKey, setOpenGroupKey] = useState<string | null>(null);
  const [outcomes, setOutcomes] = useState<Record<number, ProgramApplyOutcome>>(
    {},
  );

  return withLoading({
    isLoading,
    children: (
      <div className="mt-30 flex w-full max-w-[816px] flex-col gap-24">
        <DetailHeader headerTitle={`${label} 신청`} />
        <p className="text-body2r text-gray-500">
          신청할 {label}마다 따로 신청합니다. 결과도 {label}별로 표시됩니다.
        </p>
        {error && <p className="text-body2r text-error">{error.message}</p>}
        {programs?.length === 0 && (
          <p className="text-body2r text-gray-500">
            신청할 수 있는 {label}이 없습니다.
          </p>
        )}
        {groups.map((group) => {
          const program =
            group.sessions.find((s) => s.id === selectedByGroup[group.key]) ??
            group.sessions[0];
          const formId = getProgramFormId(program);
          const outcome = outcomes[program.id];
          const isOpen = openGroupKey === group.key;
          const existing = getGroupApplications(
            group,
            programType,
            applications,
            participants,
          );
          return (
            <section
              key={group.key}
              className="flex flex-col gap-16 rounded-sm border-1 border-solid border-gray-200 p-24"
            >
              <div className="flex items-center justify-between gap-16">
                <p className="text-body1b">{program.title}</p>
                <Button
                  type="button"
                  disabled={!formId}
                  onClick={() => setOpenGroupKey(isOpen ? null : group.key)}
                >
                  {isOpen ? '닫기' : '신청'}
                </Button>
              </div>
              {group.sessions.length > 1 && (
                <fieldset className="flex flex-col gap-8">
                  <legend className="mb-8 text-body2b">회차 선택</legend>
                  {group.sessions.map((session) => (
                    <label
                      key={session.id}
                      className="flex flex-wrap items-center gap-8 text-body2r"
                    >
                      <input
                        type="radio"
                        name={`session-${group.key}`}
                        checked={session.id === program.id}
                        onChange={() => {
                          setSelectedByGroup((prev) => ({
                            ...prev,
                            [group.key]: session.id,
                          }));
                          // 신청서를 닫아 이전 회차의 참가자 선택·답변·정책을 버린다. 다시 열면 새 회차로 조회한다
                          setOpenGroupKey(null);
                        }}
                      />
                      {session.title} · {formatFormPeriod(session.startedAt)} ~{' '}
                      {formatFormPeriod(session.endedAt)}
                      {session.policy?.closed && (
                        <span className="text-caption1r text-gray-500">
                          (마감)
                        </span>
                      )}
                    </label>
                  ))}
                </fieldset>
              )}
              {existing.length > 0 && (
                <div
                  role="status"
                  className="flex flex-col gap-4 break-keep text-caption1r text-gray-600"
                >
                  {existing.map(({ application, participantName, session }) => (
                    <p key={application.applicationId}>
                      {participantName}: {session.title}{' '}
                      {formatFormPeriod(session.startedAt)} 회차{' '}
                      {application.status === 'CONFIRMED' ? '확정' : '대기'}
                    </p>
                  ))}
                  <p>
                    같은 묶음은 참가자마다 하나만 신청할 수 있습니다. 회차를
                    바꾸려면{' '}
                    <Link
                      href={`/application/forms/${expoId}`}
                      className="text-main-600 underline"
                    >
                      내 신청
                    </Link>
                    에서 기존 신청을 확인하고, 취소가 가능하면 취소한 뒤 다시
                    신청해주세요. 자동으로 바뀌지 않으며 최종 판정은 서버가
                    합니다.
                  </p>
                </div>
              )}
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
                  이 {programType === 'TRAINING' ? '연수는' : '프로그램은'} 아직
                  온라인 신청서가 연결되지 않았습니다.
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
              {formId && isOpen && (
                <ParticipantLookup
                  key={program.id}
                  expoId={expoId}
                  programType={programType}
                  program={program}
                  waiting={!!waitlist}
                  formId={formId}
                  onResult={(next) => {
                    setOutcomes((prev) => ({ ...prev, [program.id]: next }));
                    // 접수·거절 모두 내 신청·취소 가능 여부가 바뀔 수 있어 다시 받는다
                    ['myApplications', 'programParticipants'].forEach((key) =>
                      queryClient.invalidateQueries({
                        queryKey: [key, expoId],
                      }),
                    );
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

export default ProgramApplyContainer;
