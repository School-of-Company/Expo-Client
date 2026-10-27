'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment, ReactNode, useMemo, useRef, useState } from 'react';
import { PrivacyConsent } from '@/entities/application';
import { getProgramForm } from '@/entities/form/api/programForms';
import { adaptDynamicFormToSchema } from '@/features/form/common/lib/formAdapter';
import { buildProgramApplyPayload } from '@/features/form/program';
import { FormValues as RendererFormValues } from '@/features/form/renderer/lib/visibilityEngine';
import { FormRenderer } from '@/features/form/renderer/ui';
import { SessionNotice } from '@/features/phone-verification';
import { formatDefinitionSchedule } from '@/features/registration/common/model/ledger';
import { getPublicStandardProgram, getTrainingProgram } from '@/shared/api';
import { getExpoRoutes } from '@/shared/config';
import { withLoading } from '@/shared/hocs';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import { getProgramSessionCsrfHeaders } from '@/shared/libs/http/programSessionCsrf';
import { DynamicFormValues } from '@/shared/types/application/type';
import { Button, DetailHeader } from '@/shared/ui';
import {
  ApplicationSubmitError,
  postProgramApplication,
} from '../../../api/postApplication';
import { createSubmissionKeys } from '../../../lib/createSubmissionKeys';
import { getPublicPreregisterSessions } from '../../api/preRegister';
import { getProgramParticipants } from '../../api/programParticipants';
import {
  SCHEDULE_STATUS_LABEL,
  ScheduleStatus,
  getOnsitePhase,
  getProgramScheduleStatus,
  getScheduleBoundaries,
  isPreApplicationOpen,
} from '../../model/applicationSchedule';
import {
  PROGRAM_CATEGORIES,
  TRAINING_CATEGORIES,
  filterByCategory,
} from '../../model/applicationSections';
import { useFieldRelease } from '../../model/fieldRelease';
import { formatFormPeriod } from '../../model/formPeriodStatus';
import {
  OUTCOME_LABEL,
  ProgramApplyOutcome,
  REUSED_GUARDIAN_NOTE,
  getProgramFormId,
  getIneligibleLabel,
  getOnsiteSeatsLabel,
  getSeatsLabel,
  getProgramPolicyNotes,
  getProgramInfoRows,
  isProgramApplicationEnded,
} from '../../model/programApply';
import { getGroupApplications, groupPrograms } from '../../model/programGroups';
import {
  getConfirmedSessionWindows,
  matchesSessionTime,
} from '../../model/sessionTimeMatch';
import { useLiveSeats } from '../../model/useLiveSeats';
import { useMyApplications } from '../../model/useMyApplications';
import { useNow } from '../../model/useNow';
import { getPreRegisterSessionState } from '../../model/usePreRegister';
import CompanionApplyFlow from '../CompanionApplyFlow';
import { LiveSeatsNote, SeatSummary } from '../LiveSeats';
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
                ({getIneligibleLabel(participant.reason, program.startedAt)})
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
  isFieldReleased,
  onSelect,
  onResult,
}: {
  expoId: string;
  programType: ProgramType;
  program: Program;
  formId: string;
  waiting: boolean;
  onsite: boolean;
  /** 행사가 시작돼 사전등록 대신 현장등록을 받는 중. 등록 안내를 현장등록으로 바꾼다 */
  isFieldReleased: boolean;
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
  if (!data.registered && isFieldReleased)
    return (
      <p className="break-keep text-body2r text-gray-600">
        현장등록을 마친 참가자만 신청할 수 있습니다.{' '}
        <Link
          href={`/application/${expoId}?formType=application&userType=STANDARD&applicationType=FIELD`}
          className="text-main-600 underline"
        >
          현장등록하러 가기
        </Link>
      </p>
    );
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
  // 현장 신청은 현장 잔여석만 보인다(대기가 없다). 사전 신청에는 현장 좌석 줄을 보이지 않는다
  const onsiteSeats = data.admissionSeats?.onsite;
  const seatInfo = (
    <>
      {onsite ? (
        (onsiteSeats || data.capacity) && (
          <p className="break-keep text-caption1r text-gray-600">
            {onsiteSeats
              ? getOnsiteSeatsLabel(onsiteSeats)
              : `현장 잔여 ${data.capacity?.remaining.toLocaleString()}명`}
            <br />
            조회 시점의 참고값이며, 신청할 때 서버가 다시 판정합니다.
          </p>
        )
      ) : (
        <>
          {data.capacity && (
            <p className="break-keep text-caption1r text-gray-600">
              {getSeatsLabel(data.capacity)}
              <br />
              조회 시점의 참고값이며, 신청할 때 서버가 다시 판정합니다.
            </p>
          )}
          {data.channels
            ?.filter((channel) => !channel.name.includes('현장'))
            .map((channel) => (
              <p
                key={channel.name}
                className="break-keep text-caption1r text-gray-600"
              >
                {channel.name}: {getSeatsLabel(channel.capacity)}
              </p>
            ))}
        </>
      )}
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
const STATUS_CLASS: Record<ScheduleStatus, string> = {
  UPCOMING: 'bg-main-100 text-main-600',
  OPEN: 'bg-main-600 text-white',
  ONSITE_OPEN: 'bg-main-600 text-white',
  CLOSED: 'bg-gray-100 text-gray-500',
  ENDED: 'bg-gray-100 text-gray-400',
  UNSET: 'bg-gray-100 text-gray-500',
};

const ProgramApplyContainer = ({
  expoId,
  programType,
  category,
  programId,
}: {
  expoId: string;
  programType: ProgramType;
  /** 목록에서 고른 분류(삼성·구글 등). 있으면 그 분류의 회차만 보여 준다 */
  category?: string;
  /** 목록에서 고른 회차 하나. 있으면 그 회차만 보여 준다 */
  programId?: string;
}) => {
  const label = PROGRAM_LABEL[programType];
  const {
    data: allPrograms,
    isLoading,
    error,
    refetch,
  } = useQuery<Program[]>({
    queryKey: ['applyPrograms', programType, expoId],
    queryFn: () =>
      programType === 'TRAINING'
        ? getTrainingProgram(expoId)
        : getPublicStandardProgram(expoId),
    retry: false,
  });
  const { data: seats, isError: seatsFailed } = useLiveSeats(expoId);
  const queryClient = useQueryClient();
  const router = useRouter();
  // 목록 조회의 401·403은 참가자의 로그인 문제가 아니므로 서버 문구를 그대로 보이지 않는다
  const programsError =
    error &&
    (getErrorStatus(error) === 401 || getErrorStatus(error) === 403
      ? `${label} 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.`
      : error.message);
  // 신청 기간이 끝난 회차는 모집 목록에서만 숨긴다. 같은 쿼리를 내 신청 조회가 쓰므로 데이터는 거르지 않는다
  // 켜 둔 화면도 사전·현장 접수 시작·마감 시각에 버튼과 상태가 바뀐다
  const now = useNow(getScheduleBoundaries(allPrograms ?? [], [], null));
  const programs = useMemo(
    () =>
      allPrograms &&
      filterByCategory(
        allPrograms.filter(
          ({ policy }) => !isProgramApplicationEnded(policy, now),
        ),
        programType === 'TRAINING' ? TRAINING_CATEGORIES : PROGRAM_CATEGORIES,
        category,
      ).filter((program) => !programId || String(program.id) === programId),
    [allPrograms, now, programType, category, programId],
  );
  // 사전등록 대기 중인 일행이 있으면 "미등록" 대신 대기 안내를 보여 준다
  const {
    waitlists,
    applications,
    participants,
    errorMessage,
    sessionIssue,
    retry,
  } = useMyApplications(expoId);
  // 내 확정 사전등록 회차와 시간이 겹치는 프로그램을 위로, 나머지는 아래로 둔다(숨기지 않는다).
  // 확정 회차를 알 수 없으면 정렬·비활성을 하지 않는다
  const hasConfirmedPreRegister = applications.some(
    ({ type, status }) => type === 'PREREGISTER' && status === 'CONFIRMED',
  );
  const { data: preRegisterSessions } = useQuery({
    queryKey: ['preRegisterSessions', expoId],
    queryFn: () => getPublicPreregisterSessions(expoId),
    enabled: hasConfirmedPreRegister,
    retry: false,
    meta: { silent: true },
  });
  // 확정·대기 중인 사전등록 회차. 이미 신청한 회차를 다시 추천하지 않는다
  const appliedSessionIds = useMemo(
    () =>
      new Set(
        applications
          .filter(
            ({ type, status }) =>
              type === 'PREREGISTER' &&
              (status === 'CONFIRMED' || status === 'WAITING'),
          )
          .map(({ sessionOrProgramId }) => sessionOrProgramId),
      ),
    [applications],
  );
  const sessionWindows = useMemo(
    () => getConfirmedSessionWindows(applications, preRegisterSessions),
    [applications, preRegisterSessions],
  );
  const groups = useMemo(
    () =>
      groupPrograms(programs ?? [])
        .map((group) => ({
          group,
          matches: group.sessions.some((session) =>
            matchesSessionTime(session, sessionWindows),
          ),
        }))
        // 안정 정렬이라 같은 쪽끼리는 기존 순서를 지킨다
        .sort((a, b) => Number(b.matches) - Number(a.matches))
        .map(({ group }) => group),
    [programs, sessionWindows],
  );
  // 묶음별로 고른 회차와 신청서를 연 묶음. 회차를 바꾸면 신청서를 닫아 이전 회차의 선택·답변이 남지 않게 한다
  const [selectedByGroup, setSelectedByGroup] = useState<
    Record<string, number>
  >({});
  const [openGroupKey, setOpenGroupKey] = useState<string | null>(null);
  // 신청 경로를 직접 고른 묶음(true 현장, false 사전). 고르지 않으면 현장 접수 기간 중에는 현장이 기본이다
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
  // 행사가 시작되면 사전등록을 받지 않으므로 회차 사전등록으로 보내지 않는다
  const { released: isFieldReleased } = useFieldRelease(expoId);

  return withLoading({
    isLoading,
    children: (
      <div className="mt-30 flex w-full max-w-[816px] flex-col gap-24">
        <DetailHeader
          headerTitle={`${label} 신청`}
          // 인증 화면을 거치거나 링크로 바로 열면 이전 기록이 없거나 인증 화면이라 신청 목록으로 보낸다
          onBack={() =>
            router.push(
              getExpoRoutes(expoId).applicationListTab(
                programType === 'TRAINING' ? 'training' : 'program',
              ),
            )
          }
        />
        <p className="break-keep text-body2r text-gray-500">
          {label}마다 따로 신청합니다.
        </p>
        <LiveSeatsNote fetchedAt={seats?.fetchedAt} failed={seatsFailed} />
        {programsError && (
          <div role="alert" className="flex flex-col gap-8">
            <p className="text-body2r text-error">{programsError}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="self-start rounded-sm border-1 border-solid border-main-600 px-16 py-8 text-caption1b text-main-600"
            >
              다시 시도
            </button>
          </div>
        )}
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
            신청할 수 있는{' '}
            {programType === 'TRAINING' ? '연수가' : '프로그램이'} 없습니다.
          </p>
        )}
        {groups.map((group) => {
          const program =
            group.sessions.find((s) => s.id === selectedByGroup[group.key]) ??
            group.sessions[0];
          const formId = getProgramFormId(program);
          const outcome = outcomes[program.id];
          const isOpen = openGroupKey === group.key;
          const status = getProgramScheduleStatus(program, now);
          // 현장 신청은 현장 접수 기간 중에만 고를 수 있다. 기간 중에는 현장이 기본이고,
          // 사전 접수 기간이 끝났으면 사전 신청은 고를 수 없다
          const onsiteOpen =
            !program.policy?.closed &&
            getOnsitePhase(program.policy, now) === 'OPEN';
          const preOpen =
            !!program.policy && isPreApplicationOpen(program.policy, now);
          const onsite =
            onsiteOpen && (!preOpen || onsiteGroups[group.key] !== false);
          // 현장 신청은 사전등록 회차와 상관없는 경로라 맞추지 않는다
          const isTimeMismatch =
            !onsite && !matchesSessionTime(program, sessionWindows);
          // 시간이 맞지 않으면 이 프로그램 시간과 겹치고 아직 신청하지 않은 접수 중 회차를 골라 사전등록을 안내한다
          const addSession =
            isTimeMismatch && !isFieldReleased
              ? preRegisterSessions?.find(
                  (session) =>
                    getPreRegisterSessionState(session) === 'OPEN' &&
                    matchesSessionTime(program, [session]) &&
                    !appliedSessionIds.has(session.id),
                )
              : undefined;
          // 현장 신청은 사전 접수 기간과 따로 서버가 판정하므로 막지 않는다. 운영 마감은 경로와 상관없이 막는다
          const blockedLabel =
            program.policy?.closed || status === 'ENDED'
              ? '신청 마감'
              : isTimeMismatch
                ? '회차 시간이 맞지 않음'
                : onsite
                  ? undefined
                  : status === 'UPCOMING' && program.policy
                    ? `${formatFormPeriod(program.policy.applicationStartedAt)}부터 신청`
                    : status === 'CLOSED'
                      ? '사전 신청 마감'
                      : undefined;
          const notes = program.policy
            ? getProgramPolicyNotes(
                program.policy,
                sharedGroups.has(program.policy.groupId ?? '')
                  ? label
                  : undefined,
              )
            : [];
          const existing = getGroupApplications(
            group,
            programType,
            applications,
            participants,
          );
          return (
            <section
              key={group.key}
              className={`flex flex-col gap-20 rounded-sm border-1 border-solid p-24 mobile:p-16 ${isTimeMismatch ? 'relative overflow-hidden border-[#f5b5b8]' : 'border-gray-200'}`}
            >
              <div className="flex min-w-0 items-start justify-between gap-12">
                <p
                  className={`min-w-0 break-words break-keep text-h3b text-black mobile:text-body1b ${isTimeMismatch ? 'pr-48' : ''}`}
                >
                  {program.title}
                </p>
                {isTimeMismatch ? (
                  <span
                    aria-hidden
                    className="absolute -right-40 top-24 w-[150px] rotate-45 bg-error py-4 text-center text-caption1b text-white"
                  >
                    신청 불가
                  </span>
                ) : (
                  <span
                    className={`flex-none rounded-full px-12 py-4 text-caption1b ${STATUS_CLASS[status]}`}
                  >
                    {SCHEDULE_STATUS_LABEL[status]}
                  </span>
                )}
              </div>

              {isTimeMismatch && (
                <div
                  role="status"
                  className="flex items-center gap-12 break-keep rounded-sm bg-[#fdeced] px-16 py-12"
                >
                  <span
                    aria-hidden
                    className="flex h-28 w-28 flex-none items-center justify-center rounded-full bg-error text-body2b text-white"
                  >
                    ✕
                  </span>
                  <div className="flex flex-col gap-2">
                    <p className="text-body2b text-error">
                      사전등록 회차와 시간이 맞지 않습니다.
                    </p>
                    <p className="text-caption1r text-gray-700">
                      선생님이 사전등록한 회차와 다른 시간의 프로그램입니다.
                    </p>
                  </div>
                </div>
              )}

              {group.sessions.length > 1 && (
                <fieldset className="flex flex-col gap-8">
                  <legend className="mb-8 text-body2b text-black">
                    회차 선택
                  </legend>
                  <div className="grid grid-cols-2 gap-8 mobile:grid-cols-1">
                    {group.sessions.map((session) => {
                      const checked = session.id === program.id;
                      return (
                        <label
                          key={session.id}
                          className={`flex cursor-pointer flex-col gap-2 rounded-sm border-1 border-solid px-16 py-12 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-main-300 ${checked ? 'border-main-600 bg-main-100' : 'border-gray-200 bg-white'}`}
                        >
                          <input
                            type="radio"
                            className="sr-only"
                            name={`session-${group.key}`}
                            checked={checked}
                            onChange={() => {
                              setSelectedByGroup((prev) => ({
                                ...prev,
                                [group.key]: session.id,
                              }));
                              // 신청서를 닫아 이전 회차의 참가자 선택·답변·정책을 버린다. 다시 열면 새 회차로 조회한다
                              setOpenGroupKey(null);
                            }}
                          />
                          <span
                            className={`text-body2b ${checked ? 'text-main-600' : 'text-black'}`}
                          >
                            {formatDefinitionSchedule(
                              session.startedAt,
                              session.endedAt,
                            )}
                            {session.policy?.closed && (
                              <span className="ml-4 text-caption1r text-gray-500">
                                (마감)
                              </span>
                            )}
                          </span>
                          <span className="break-words break-keep text-caption1r text-gray-500">
                            {session.title}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              <dl className="grid grid-cols-[88px_1fr] gap-x-16 gap-y-10 rounded-sm bg-gray-100 px-20 py-16 mobile:grid-cols-[72px_1fr] mobile:px-16">
                {getProgramInfoRows(program, now).map(
                  ({ label: name, value }) => (
                    <Fragment key={name}>
                      <dt className="text-body2r text-gray-500">{name}</dt>
                      <dd className="min-w-0 break-words break-keep text-body2b text-black">
                        {value}
                      </dd>
                    </Fragment>
                  ),
                )}
              </dl>
              <SeatSummary
                group={seats?.programs[programType]}
                id={program.id}
              />

              {onsiteOpen && (
                <fieldset className="flex flex-col gap-8">
                  <legend className="mb-8 text-body2b text-black">
                    신청 경로
                  </legend>
                  <div className="flex gap-8">
                    {(preOpen ? [false, true] : [true]).map((isOnsite) => (
                      <label
                        key={String(isOnsite)}
                        className={`flex-1 cursor-pointer rounded-sm border-1 border-solid px-16 py-10 text-center text-body2b has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-main-300 ${onsite === isOnsite ? 'border-main-600 bg-main-100 text-main-600' : 'border-gray-200 text-gray-600'}`}
                      >
                        <input
                          type="radio"
                          className="sr-only"
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
                  </div>
                  {onsite && (
                    <p className="break-keep text-caption1r text-gray-500">
                      현장 신청은 현장 정원 안에서 바로 확정되며, 정원이
                      부족하면 대기 없이 거절됩니다.
                    </p>
                  )}
                </fieldset>
              )}

              {isTimeMismatch && !isFieldReleased && (
                <Link
                  href={getExpoRoutes(expoId).applicationMy}
                  className="flex h-[44px] items-center justify-center rounded-sm border-1 border-solid border-main-600 bg-white text-body2b text-main-600"
                >
                  사전등록한 회차로 이동하기 →
                </Link>
              )}
              {addSession && (
                <Link
                  href={`${getExpoRoutes(expoId).applicationMy}&addSessionId=${addSession.id}`}
                  className="text-center text-body2b text-main-600 underline"
                >
                  이 시간대 회차 추가 사전등록 · {addSession.title}
                </Link>
              )}
              {isTimeMismatch && !isFieldReleased && (
                <p className="rounded-sm bg-gray-100 px-16 py-12 text-caption1r text-gray-600">
                  사전등록 시 선택한 회차와 동일한 시간의 프로그램만 신청할 수
                  있습니다.
                </p>
              )}

              {notes.length > 0 && (
                <ul className="flex flex-col gap-4 text-caption1r text-gray-500">
                  {notes.map((note) => (
                    <li key={note}>· {note}</li>
                  ))}
                </ul>
              )}

              {existing.length > 0 && (
                <div
                  role="status"
                  className="flex flex-col gap-4 break-words break-keep rounded-sm border-1 border-solid border-main-300 px-16 py-12 text-caption1r text-gray-600"
                >
                  <p className="text-body2b text-main-600">이미 신청한 회차</p>
                  {existing.map(({ application, participantName, session }) => (
                    <p key={application.applicationId}>
                      {participantName}: {session.title}{' '}
                      {formatFormPeriod(session.startedAt)} ·{' '}
                      {application.status === 'CONFIRMED' ? '확정' : '대기'}
                    </p>
                  ))}
                  <p>
                    회차를 바꾸려면{' '}
                    <Link
                      href={getExpoRoutes(expoId).applicationMy}
                      className="text-main-600 underline"
                    >
                      내 신청
                    </Link>
                    에서 기존 신청을 취소한 뒤 다시 신청해주세요.
                  </p>
                </div>
              )}

              {!formId && (
                <p className="text-caption1r text-gray-500">
                  이 {programType === 'TRAINING' ? '연수는' : '프로그램은'} 아직
                  온라인 신청서가 연결되지 않았습니다.
                </p>
              )}
              {!isTimeMismatch && (
                <Button
                  type="button"
                  disabled={!formId || !!blockedLabel}
                  onClick={() => setOpenGroupKey(isOpen ? null : group.key)}
                >
                  {blockedLabel ?? (isOpen ? '닫기' : '신청하기')}
                </Button>
              )}
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
                  waiting={waitlists.length > 0}
                  onsite={onsite}
                  isFieldReleased={isFieldReleased}
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
