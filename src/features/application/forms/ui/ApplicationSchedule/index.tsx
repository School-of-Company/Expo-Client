'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formKeys, getForm } from '@/entities/form';
import { formatDefinitionSchedule } from '@/features/registration/common/model/ledger';
import { getPublicStandardProgram, getTrainingProgram } from '@/shared/api';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import {
  SCHEDULE_STATUS_LABEL,
  getPreRegisterScheduleStatus,
  getProgramCapacity,
  getProgramScheduleStatus,
  getScheduleBoundaries,
} from '../../model/applicationSchedule';
import {
  PROGRAM_CATEGORIES,
  TRAINING_CATEGORIES,
  groupByCategory,
} from '../../model/applicationSections';
import {
  formatFormPeriod,
  getFormPeriodStatus,
} from '../../model/formPeriodStatus';
import { getOccupationLock } from '../../model/occupationOpen';
import { useLiveSeats } from '../../model/useLiveSeats';
import { useNow } from '../../model/useNow';
import { usePreRegisterSessions } from '../../model/usePreRegister';
import { LiveSeatsNote, SeatSummary } from '../LiveSeats';
import CategoryCard, { CategorySession } from './CategoryCard';
import {
  ApplicationSteps,
  PreRegisterRequired,
  SectionFrame,
  SectionTabs,
} from './SectionFrame';
import type { Program, ProgramType } from '@/shared/types/program/list/type';

const usePublicPrograms = (expoId: string, programType: ProgramType) =>
  // 프로그램 신청 화면과 같은 키라 캐시를 같이 쓴다
  useQuery<Program[]>({
    queryKey: ['applyPrograms', programType, expoId],
    queryFn: () =>
      programType === 'STANDARD'
        ? getPublicStandardProgram(expoId)
        : getTrainingProgram(expoId),
    retry: false,
    // 실패한 조회는 화면이 다시 그려질 때마다 다시 보내지 않고 "다시 불러오기"로만 다시 받는다
    retryOnMount: false,
    meta: { silent: true },
  });

const period = (start: string, end: string) =>
  `${formatFormPeriod(start)} ~ ${formatFormPeriod(end)}`;

const PRE_REGISTER_GUIDE = [
  '박람회 입장을 위해 사전등록이 필요합니다. 방문 날짜와 시간대를 선택해 신청해 주세요.',
  '사전등록은 대표자 본인을 포함하여 최대 5명까지 가능합니다.',
  '\n※ 교원·예비교사는 10.22.(목) 09:00부터, 그 외 방문객은 10.26.(월) 08:30부터 신청할 수 있습니다.',
];

const byStart = (a: { startedAt: string }, b: { startedAt: string }) =>
  a.startedAt.localeCompare(b.startedAt);

const STATUS_BADGE_CLASS = {
  UPCOMING: 'bg-gray-100 text-gray-600',
  OPEN: 'bg-main-600 text-white',
  ONSITE_OPEN: 'bg-main-600 text-white',
  CLOSED: 'bg-gray-100 text-gray-500',
  ENDED: 'bg-gray-100 text-gray-400',
  UNSET: 'bg-gray-100 text-gray-500',
} as const;

/**
 * 신청을 사전등록 / 프로그램 신청 / 교원연수 신청 세 덩어리로 나눠 탭 버튼으로 하나씩 보여 준다. 로그인·휴대폰 인증 없이 공개 API 만 쓰고, 신청은 각 신청 화면이 기간·자격·정원을 판정한다.
 * showPreRegister 가 false 면 사전등록 덩어리를 뺀다(행사 시작 뒤에는 일반 사전등록을 닫는다)
 */
const ApplicationSchedule = ({
  expoId,
  showGuide = false,
  showPreRegister = true,
  initialTab,
}: {
  expoId: string;
  /** 현재 박람회는 사전등록 설명을 고정 안내 문구로 대신한다 */
  showGuide?: boolean;
  showPreRegister?: boolean;
  /** 주소의 `?tab=` 값. 신청 화면에서 뒤로 왔을 때 보던 탭을 연다 */
  initialTab?: string;
}) => {
  // 신청서가 없는 박람회는 404 가 정상이다
  const preForm = useQuery({
    queryKey: formKeys.detail(expoId, 'STANDARD', 'PRE'),
    queryFn: () => getForm(expoId, 'STANDARD', 'PRE'),
    retry: false,
    // 실패한 조회는 화면이 다시 그려질 때마다 다시 보내지 않고 "다시 불러오기"로만 다시 받는다
    retryOnMount: false,
    meta: { silent: true },
  });
  const sessions = usePreRegisterSessions(expoId);
  const standard = usePublicPrograms(expoId, 'STANDARD');
  const training = usePublicPrograms(expoId, 'TRAINING');
  const { data: seats, isError: seatsFailed } = useLiveSeats(expoId);

  const form = preForm.data ?? null;
  const formError =
    preForm.error && getErrorStatus(preForm.error) !== 404
      ? preForm.error
      : null;

  const occupationOpenAt = form?.occupationOpenAt
    ? new Date(form.occupationOpenAt).getTime()
    : NaN;
  const now = useNow([
    ...getScheduleBoundaries(
      [...(standard.data ?? []), ...(training.data ?? [])],
      sessions.data ?? [],
      form,
    ),
    ...(Number.isFinite(occupationOpenAt) ? [occupationOpenAt] : []),
  ]);
  // 교원·예비교사 조기 오픈. 그 외 유형의 오픈 시각이 지나면 안내를 거둔다
  const occupationLock = getOccupationLock(form?.occupationOpenAt, now);
  const formStatus = form
    ? getFormPeriodStatus(form.startDate, form.endDate, new Date(now))
    : null;

  const toCategorySession = (program: Program): CategorySession => ({
    id: program.id,
    title: program.title,
    startedAt: program.startedAt,
    endedAt: program.endedAt,
    place: program.place,
    status: getProgramScheduleStatus(program, now),
    capacity: getProgramCapacity(program, now),
  });

  const programGroups = useMemo(
    () => groupByCategory(standard.data ?? [], PROGRAM_CATEGORIES),
    [standard.data],
  );
  const trainingGroups = useMemo(
    () => groupByCategory(training.data ?? [], TRAINING_CATEGORIES),
    [training.data],
  );

  const navItems = useMemo(
    () => [
      ...(showPreRegister
        ? [{ id: 'section-registration', label: '사전등록', step: '1단계' }]
        : []),
      {
        id: 'section-program',
        label: '프로그램 신청',
        ...(showPreRegister && { step: '2단계' }),
      },
      {
        id: 'section-training',
        label: '교원연수 신청',
        ...(showPreRegister && { step: '2단계' }),
      },
    ],
    [showPreRegister],
  );

  const [tab, setTab] = useState(
    navItems.find(({ id }) => id === `section-${initialTab}`)?.id ??
      navItems[0].id,
  );
  const changeTab = (id: string) => {
    setTab(id);
    // 브라우저 뒤로 가기로 돌아와도 같은 탭이 열리게 주소에 남긴다
    const url = new URL(window.location.href);
    url.searchParams.set('tab', id.replace('section-', ''));
    window.history.replaceState(window.history.state, '', url);
  };
  // 사전등록 탭이 빠진 뒤에도 고른 탭이 남아 있지 않게 첫 탭으로 돌린다
  const active = navItems.some(({ id }) => id === tab) ? tab : navItems[0].id;

  const sessionList = [...(sessions.data ?? [])].sort(byStart);

  return (
    <div className="flex flex-col gap-20">
      {showPreRegister && <ApplicationSteps />}
      <SectionTabs items={navItems} active={active} onChange={changeTab} />

      {showPreRegister && active === 'section-registration' && (
        <SectionFrame
          id="section-registration"
          title="사전등록"
          description={
            formError
              ? '신청 기간을 불러오지 못했습니다.'
              : form
                ? (showGuide
                    ? PRE_REGISTER_GUIDE
                    : [
                        `신청 기간 ${period(form.startDate, form.endDate)}`,
                        occupationLock &&
                          `교원·예비교사는 ${formatFormPeriod(form.startDate)}부터, 그 외 유형은 ${formatFormPeriod(form.occupationOpenAt ?? '')}부터 신청할 수 있습니다.`,
                      ]
                  )
                    .filter(Boolean)
                    .join('\n')
                : '신청 기간은 추후 안내합니다.'
          }
          error={sessions.error}
          onRetry={() => {
            sessions.refetch();
            if (formError) preForm.refetch();
          }}
          isLoading={sessions.isLoading || preForm.isLoading}
          isEmpty={sessions.data?.length === 0}
        >
          <LiveSeatsNote fetchedAt={seats?.fetchedAt} failed={seatsFailed} />
          <ul className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
            {sessionList.map((session) => {
              // 신청서 기간을 못 받았으면 접수 여부를 단정하지 않는다
              const status = getPreRegisterScheduleStatus(
                formError ? null : formStatus,
                session,
                now,
              );
              return (
                <li
                  key={session.id}
                  className="flex min-w-0 flex-col gap-12 rounded-sm border-1 border-solid border-gray-200 bg-white p-20"
                >
                  <div className="flex items-center justify-between gap-8">
                    <h3 className="break-keep text-body1b text-black">
                      {session.title}
                    </h3>
                    <span
                      className={`flex-none rounded-full px-12 py-4 text-caption1b ${STATUS_BADGE_CLASS[status]}`}
                    >
                      {SCHEDULE_STATUS_LABEL[status]}
                    </span>
                  </div>
                  <p className="text-body2b text-black">
                    {formatDefinitionSchedule(
                      session.startedAt,
                      session.endedAt,
                    )}
                  </p>
                  {session.place && (
                    <p className="break-keep text-caption1r text-gray-500">
                      장소: {session.place}
                    </p>
                  )}
                  <SeatSummary group={seats?.preRegister} id={session.id} />
                  {status === 'UPCOMING' && form && (
                    <p className="break-keep text-caption1r text-gray-500">
                      {formatFormPeriod(form.startDate)}부터 신청할 수 있습니다.
                    </p>
                  )}
                  {status === 'OPEN' ? (
                    <Link
                      href={`/application/forms/${expoId}/pre-register?sessionId=${session.id}`}
                      className="mt-auto rounded-sm bg-main-600 px-16 py-12 text-center text-body2b text-white"
                    >
                      사전등록하기 →
                    </Link>
                  ) : (
                    <span
                      aria-disabled
                      className="mt-auto rounded-sm bg-gray-100 px-16 py-12 text-center text-body2b text-gray-400"
                    >
                      지금은 신청할 수 없습니다
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </SectionFrame>
      )}

      {active === 'section-program' && (
        <>
          {showPreRegister && (
            <PreRegisterRequired
              onGoRegistration={() => changeTab('section-registration')}
            />
          )}
          <SectionFrame
            id="section-program"
            title="프로그램 신청"
            description="사전등록이 확정된 참가자가 신청합니다. 기조강연, AI·SW 골든벨, 전시체험 투어 등 모든 회차를 바로 확인하고 선택할 수 있습니다."
            error={standard.error}
            onRetry={() => standard.refetch()}
            isLoading={standard.isLoading}
            isEmpty={standard.data?.length === 0}
          >
            <LiveSeatsNote fetchedAt={seats?.fetchedAt} failed={seatsFailed} />
            <ul className="flex flex-col gap-16">
              {programGroups.map((group) => (
                <CategoryCard
                  key={group.key}
                  group={group}
                  sessions={group.sessions.map(toCategorySession)}
                  applyHref={`/application/forms/${expoId}/program`}
                  seats={seats?.programs.STANDARD}
                  selectable
                />
              ))}
            </ul>
          </SectionFrame>
        </>
      )}

      {active === 'section-training' && (
        <>
          {showPreRegister && (
            <PreRegisterRequired
              onGoRegistration={() => changeTab('section-registration')}
            />
          )}
          <SectionFrame
            id="section-training"
            title="교원연수 신청"
            description="교사·예비교사가 신청합니다. 삼성 → 구글 → 애플 순서로 모든 연수 회차를 바로 확인하고 선택할 수 있습니다."
            error={training.error}
            onRetry={() => training.refetch()}
            isLoading={training.isLoading}
            isEmpty={training.data?.length === 0}
          >
            <LiveSeatsNote fetchedAt={seats?.fetchedAt} failed={seatsFailed} />
            <ul className="flex flex-col gap-16">
              {trainingGroups.map((group) => (
                <CategoryCard
                  key={group.key}
                  group={group}
                  sessions={group.sessions.map(toCategorySession)}
                  applyHref={`/application/forms/${expoId}/training`}
                  seats={seats?.programs.TRAINING}
                  selectable
                />
              ))}
            </ul>
          </SectionFrame>
        </>
      )}
    </div>
  );
};

export default ApplicationSchedule;
