'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ReactNode, useMemo, useRef, useState } from 'react';
import { PrivacyConsent } from '@/entities/application';
import { getProgramForm } from '@/entities/form/api/programForms';
import { adaptDynamicFormToSchema } from '@/features/form/common/lib/formAdapter';
import { buildProgramApplyPayload } from '@/features/form/program';
import { FormValues as RendererFormValues } from '@/features/form/renderer/lib/visibilityEngine';
import { FormRenderer } from '@/features/form/renderer/ui';
import { SessionNotice } from '@/features/phone-verification';
import { getPublicStandardProgram, getTrainingProgram } from '@/shared/api';
import { getExpoRoutes } from '@/shared/config';
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
  REUSED_GUARDIAN_NOTE,
  formatProgramPlace,
  getProgramFormId,
  getIneligibleLabel,
  getSeatsLabel,
  getProgramPolicyNotes,
  getProgramRecruitmentLabel,
  isProgramApplicationEnded,
} from '../../model/programApply';
import { getGroupApplications, groupPrograms } from '../../model/programGroups';
import { useMyApplications } from '../../model/useMyApplications';
import { useNow } from '../../model/useNow';
import CompanionApplyFlow from '../CompanionApplyFlow';
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
  participantId,
  participantName,
  onsite,
  onResult,
}: {
  expoId: string;
  programType: ProgramType;
  program: Program;
  formId: string;
  // 고른 참가자. 부모가 key={participantId} 로 감싸 전환하면 답변·멱등 키가 새로 시작된다
  participantId: number;
  participantName: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 연타가 state 갱신 전에 두 번 들어오지 않게 막는다
  const inFlight = useRef(false);
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
        onsite,
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
    <>
      <p className="mb-16 text-body2b">신청 대상: {participantName}</p>
      <FormRenderer
        schema={schema}
        onSubmit={onSubmit}
        renderFooter={(methods) => (
          <div className="mt-24 flex flex-col gap-24">
            <PrivacyConsent
              content={form?.informationText ?? ''}
              watch={methods.watch}
              setValue={methods.setValue}
            />
            <p className="break-keep text-caption1r text-gray-500">
              조회 뒤 정원·자격이 달라질 수 있어, 제출할 때 서버가 다시 확인하고
              거절할 수 있습니다.
            </p>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? '신청 중...'
                : `${participantName} · ${program.title} 신청하기`}
            </Button>
          </div>
        )}
      />
    </>
  );
};

// 참가자를 먼저 고른 뒤 그 사람의 폼을 연다. 자동 선택하지 않으며, 불가 참가자는 사유와 함께 선택만 막는다
const ParticipantStep = ({
  program,
  participants,
  onSelect,
  children,
}: {
  program: Program;
  participants: {
    participantId: number;
    name: string;
    eligible: boolean;
    reason?: string | null;
  }[];
  onSelect: () => void;
  children: (participant: { participantId: number; name: string }) => ReactNode;
}) => {
  const [selectedId, setSelectedId] = useState<number>();
  // 다시 받은 목록에서 빠졌거나 불가로 바뀐 참가자는 선택을 해제한다
  const selected = participants.find(
    (p) => p.participantId === selectedId && p.eligible,
  );
  return (
    <>
      <fieldset className="flex flex-col gap-8">
        <legend className="mb-8 text-body2b">신청할 참가자를 선택하세요</legend>
        {participants.map((participant) => (
          <label
            key={participant.participantId}
            className="flex flex-wrap items-center gap-8 text-body2r"
          >
            <input
              type="radio"
              name={`participant-${program.id}`}
              checked={selected?.participantId === participant.participantId}
              disabled={!participant.eligible}
              onChange={() => {
                setSelectedId(participant.participantId);
                onSelect();
              }}
            />
            {participant.name}
            {!participant.eligible && (
              <span className="text-caption1r text-gray-500">
                ({getIneligibleLabel(participant.reason)})
              </span>
            )}
          </label>
        ))}
      </fieldset>
      {selected && children(selected)}
    </>
  );
};

// 신청 가능한 참가자는 서버가 프로그램별로 판단한다. 조회 실패·미등록·대상 없음을 구분해 안내한다
const ParticipantLookup = ({
  expoId,
  programType,
  program,
  formId,
  waiting,
  onsite,
  onSelect,
  onResult,
}: {
  expoId: string;
  programType: ProgramType;
  program: Program;
  formId: string;
  waiting: boolean;
  onsite: boolean;
  onSelect: () => void;
  onResult: (outcome: ProgramApplyOutcome) => void;
}) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ['programParticipants', expoId, programType, program.id, onsite],
    queryFn: () =>
      getProgramParticipants(expoId, programType, program.id, onsite),
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
  const members = data.participants.map(
    ({ participant, eligible, ineligibleReason }) => ({
      participantId: participant.participantId,
      name: participant.name,
      eligible,
      reason: ineligibleReason,
      occupation: participant.occupation,
      // 이미 신청한 보호자는 신청 불가로 내려오지만 재사용 후보다. 재사용 가능 여부는 서버가 판정한다
      guardianApplied:
        participant.occupation === 'PARENT' &&
        ineligibleReason === 'GROUP_ALREADY_APPLIED',
    }),
  );
  const seatInfo = (
    <>
      {data.capacity && (
        <p className="break-keep text-caption1r text-gray-600">
          {getSeatsLabel(data.capacity)}
          <br />
          조회 시점의 참고값이며, 신청할 때 서버가 다시 판정합니다.
        </p>
      )}
      {data.channels?.map((channel) => (
        <p
          key={channel.name}
          className="break-keep text-caption1r text-gray-600"
        >
          {channel.name}: {getSeatsLabel(channel.capacity)}
        </p>
      ))}
    </>
  );
  if (program.policy?.guardianPolicy) {
    if (!members.some((m) => m.eligible))
      return (
        <p className="break-keep text-body2r text-gray-600">
          이 프로그램을 신청할 수 있는 참가자가 없습니다. 직업·정원·신청 기간
          또는 이미 신청한 같은 묶음 프로그램을 확인해주세요.
        </p>
      );
    return (
      <>
        {seatInfo}
        <CompanionApplyFlow
          expoId={expoId}
          programType={programType}
          program={program}
          formId={formId}
          participants={members}
          onsite={onsite}
          onResult={onResult}
        />
      </>
    );
  }
  return (
    <>
      {seatInfo}
      {!members.some((m) => m.eligible) && (
        <p className="break-keep text-body2r text-gray-600">
          이 프로그램을 신청할 수 있는 참가자가 없습니다. 아래 사유를
          확인해주세요.
        </p>
      )}
      <ParticipantStep
        program={program}
        participants={members}
        onSelect={onSelect}
      >
        {({ participantId, name }) => (
          <ProgramApplyForm
            key={participantId}
            expoId={expoId}
            programType={programType}
            program={program}
            formId={formId}
            participantId={participantId}
            participantName={name}
            onsite={onsite}
            onResult={onResult}
          />
        )}
      </ParticipantStep>
    </>
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
    data: allPrograms,
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
  // 신청 기간이 끝난 회차는 모집 목록에서만 숨긴다. 같은 쿼리를 내 신청 조회가 쓰므로 데이터는 거르지 않는다
  const now = useNow(
    (allPrograms ?? []).map(({ policy }) =>
      new Date(policy?.applicationEndedAt ?? NaN).getTime(),
    ),
  );
  const programs = useMemo(
    () =>
      allPrograms?.filter(
        ({ policy }) => !isProgramApplicationEnded(policy, now),
      ),
    [allPrograms, now],
  );
  // 사전등록 대기 중인 일행이 있으면 "미등록" 대신 대기 안내를 보여 준다
  const {
    waitlist,
    applications,
    participants,
    errorMessage,
    sessionIssue,
    retry,
  } = useMyApplications(expoId);
  const groups = useMemo(() => groupPrograms(programs ?? []), [programs]);
  // 묶음별로 고른 회차와 신청서를 연 묶음. 회차를 바꾸면 신청서를 닫아 이전 회차의 선택·답변이 남지 않게 한다
  const [selectedByGroup, setSelectedByGroup] = useState<
    Record<string, number>
  >({});
  const [openGroupKey, setOpenGroupKey] = useState<string | null>(null);
  // 현장 신청 경로를 고른 묶음. 기본은 사전 신청이다
  const [onsiteGroups, setOnsiteGroups] = useState<Record<string, boolean>>({});
  // 둘 이상의 프로그램이 함께 쓰는 묶음
  const sharedGroups = useMemo(() => {
    const counts = new Map<string, number>();
    programs?.forEach(({ policy }) => {
      if (policy?.groupId)
        counts.set(policy.groupId, (counts.get(policy.groupId) ?? 0) + 1);
    });
    return new Set(
      Array.from(counts).flatMap(([groupId, count]) =>
        count > 1 ? [groupId] : [],
      ),
    );
  }, [programs]);
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
          // 라디오는 현장 정원이 있는 회차에서만 보이므로, 정원 없는 회차로 바꾸면 사전 신청으로 돌아간다
          const onsite =
            !!program.policy?.onsiteCapacity && !!onsiteGroups[group.key];
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
              <div className="flex min-w-0 flex-wrap items-center gap-8">
                <p className="min-w-0 break-words break-keep text-body1b">
                  {program.title}
                </p>
                <span className="rounded-sm border-1 border-solid border-gray-200 px-8 py-4 text-caption2r text-gray-500">
                  {getProgramRecruitmentLabel(program.policy)}
                </span>
              </div>
              <p className="min-w-0 break-words break-keep text-body2r text-gray-600">
                장소: {formatProgramPlace(program.place)}
              </p>
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
                      <span className="min-w-0 break-words break-keep">
                        {session.title} · {formatFormPeriod(session.startedAt)}{' '}
                        ~ {formatFormPeriod(session.endedAt)} ·{' '}
                        {formatProgramPlace(session.place)}
                      </span>
                      {session.policy?.closed && (
                        <span className="text-caption1r text-gray-500">
                          (마감)
                        </span>
                      )}
                    </label>
                  ))}
                </fieldset>
              )}
              {!!program.policy?.onsiteCapacity && (
                <fieldset className="flex flex-col gap-8">
                  <legend className="mb-8 text-body2b">신청 경로</legend>
                  {[false, true].map((isOnsite) => (
                    <label
                      key={String(isOnsite)}
                      className="flex items-center gap-8 text-body2r"
                    >
                      <input
                        type="radio"
                        name={`route-${group.key}`}
                        checked={onsite === isOnsite}
                        onChange={() => {
                          setOnsiteGroups((prev) => ({
                            ...prev,
                            [group.key]: isOnsite,
                          }));
                          // 경로마다 참가자 후보와 정원이 달라 신청서를 닫고 다시 조회한다
                          setOpenGroupKey(null);
                        }}
                      />
                      {isOnsite ? '현장 신청' : '사전 신청'}
                    </label>
                  ))}
                  {onsite && (
                    <p className="break-keep text-caption1r text-gray-500">
                      현장 신청은 현장 정원 안에서 바로 확정되며, 정원이
                      부족하면 대기 없이 거절됩니다. 현장 개방 여부는 서버가
                      확인합니다.
                    </p>
                  )}
                </fieldset>
              )}
              {existing.length > 0 && (
                <div
                  role="status"
                  className="flex flex-col gap-4 break-words break-keep text-caption1r text-gray-600"
                >
                  {existing.map(({ application, participantName, session }) => (
                    <p key={application.applicationId}>
                      {participantName}: {session.title}{' '}
                      {formatFormPeriod(session.startedAt)} 회차(
                      {formatProgramPlace(session.place)}){' '}
                      {application.status === 'CONFIRMED' ? '확정' : '대기'}
                    </p>
                  ))}
                  <p>
                    같은 묶음은 참가자마다 하나만 신청할 수 있습니다. 회차를
                    바꾸려면{' '}
                    <Link
                      href={getExpoRoutes(expoId).applicationMy}
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
                  {getProgramPolicyNotes(
                    program.policy,
                    sharedGroups.has(program.policy.groupId ?? '')
                      ? label
                      : undefined,
                  ).map((note) => (
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
              <Button
                type="button"
                disabled={!formId}
                onClick={() => setOpenGroupKey(isOpen ? null : group.key)}
              >
                {isOpen ? '닫기' : '신청'}
              </Button>
              {outcome && (
                <p
                  role="status"
                  className={`text-body2b ${outcome.kind === 'FAILED' ? 'text-error' : 'text-main-600'}`}
                >
                  {outcome.kind === 'FAILED'
                    ? outcome.message
                    : `${outcome.onsite ? '[현장 신청] ' : ''}${OUTCOME_LABEL[outcome.kind]}`}
                  {outcome.kind !== 'FAILED' && outcome.reusedGuardian && (
                    <>
                      <br />
                      {REUSED_GUARDIAN_NOTE}
                    </>
                  )}
                </p>
              )}
              {formId && isOpen && (
                <ParticipantLookup
                  key={program.id}
                  expoId={expoId}
                  programType={programType}
                  program={program}
                  waiting={!!waitlist}
                  onsite={onsite}
                  onSelect={() =>
                    // 다른 참가자의 이전 결과 문구가 남지 않게 한다
                    setOutcomes((prev) => {
                      const { [program.id]: _, ...rest } = prev;
                      return rest;
                    })
                  }
                  formId={formId}
                  onResult={(next) => {
                    setOutcomes((prev) => ({
                      ...prev,
                      [program.id]:
                        next.kind === 'FAILED' ? next : { ...next, onsite },
                    }));
                    // 접수·거절 모두 내 신청·취소 가능 여부가 바뀔 수 있어 다시 받는다
                    ['myApplications', 'programParticipants'].forEach((key) =>
                      queryClient.invalidateQueries({
                        queryKey: [key, expoId],
                      }),
                    );
                    queryClient.invalidateQueries({
                      queryKey: ['applyPrograms', programType, expoId],
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

export default ProgramApplyContainer;
