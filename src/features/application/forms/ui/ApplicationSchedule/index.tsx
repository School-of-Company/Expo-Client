'use client';

import { useQuery } from '@tanstack/react-query';
import { ReactNode, useId } from 'react';
import { formKeys, getForm } from '@/entities/form';
import { formatDefinitionSchedule } from '@/features/registration/common/model/ledger';
import { getPublicStandardProgram, getTrainingProgram } from '@/shared/api';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import { Loading } from '@/shared/ui';
import {
  canShowProgramCapacity,
  getPreRegisterScheduleStatus,
  getProgramScheduleStatus,
  getScheduleBoundaries,
} from '../../model/applicationSchedule';
import {
  formatFormPeriod,
  getFormPeriodStatus,
} from '../../model/formPeriodStatus';
import { formatProgramPlace } from '../../model/programApply';
import { useNow } from '../../model/useNow';
import { usePreRegisterSessions } from '../../model/usePreRegister';
import ScheduleRow from '../ScheduleRow';
import type { Program, ProgramType } from '@/shared/types/program/list/type';

const period = (start: string, end: string) =>
  `${formatFormPeriod(start)} ~ ${formatFormPeriod(end)}`;

const Section = ({
  title,
  description,
  error,
  onRetry,
  isLoading,
  isEmpty,
  children,
}: {
  title: string;
  description: string;
  error: Error | null;
  onRetry: () => void;
  isLoading: boolean;
  isEmpty: boolean;
  children: ReactNode;
}) => {
  const headingId = useId();
  return (
    <section className="flex flex-col gap-16" aria-labelledby={headingId}>
      <div className="flex flex-col gap-4">
        <h2 id={headingId} className="text-h3b text-black mobile:text-body1b">
          {title}
        </h2>
        <p className="whitespace-pre-line break-keep text-body2r text-gray-500">
          {description}
        </p>
      </div>
      {error ? (
        <div
          role="alert"
          className="flex flex-col gap-8 rounded-sm border-1 border-solid border-error bg-white p-24 mobile:p-16"
        >
          <p className="break-keep text-body2r text-gray-600">
            {error.message || '일정을 불러오지 못했습니다.'} 잠시 후 다시 시도해
            주세요.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="self-start text-body2b text-main-600 underline"
          >
            다시 불러오기
          </button>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-24">
          <Loading />
        </div>
      ) : isEmpty ? (
        <p className="rounded-sm bg-gray-100 px-16 py-12 text-body2r text-gray-500">
          등록된 회차가 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-12">{children}</ul>
      )}
    </section>
  );
};

const usePublicPrograms = (expoId: string, programType: ProgramType) =>
  // 프로그램 신청 화면과 같은 키라 캐시를 같이 쓴다
  useQuery<Program[]>({
    queryKey: ['applyPrograms', programType, expoId],
    queryFn: () =>
      programType === 'STANDARD'
        ? getPublicStandardProgram(expoId)
        : getTrainingProgram(expoId),
    retry: false,
    meta: { silent: true },
  });

const byStart = (a: { startedAt: string }, b: { startedAt: string }) =>
  a.startedAt.localeCompare(b.startedAt);

/**
 * 신청 목록의 사전등록 탭. 접수 전에도 회차·신청 기간을 보이고, 접수 중인 회차에만 신청 버튼을 연다.
 * 로그인·휴대폰 인증 없이 공개 API 만 쓰고, 신청은 각 신청 화면이 기존대로 기간·자격·정원을 판정한다.
 */
const ApplicationSchedule = ({
  expoId,
  showPreRegister = true,
}: {
  expoId: string;
  /** 행사 시작 후 현장 등록이 열리면 일반 사전등록 회차는 숨긴다 */
  showPreRegister?: boolean;
}) => {
  // 신청 목록과 같은 키라 캐시를 같이 쓴다. 신청서가 없는 박람회는 404 가 정상이다
  const preForm = useQuery({
    queryKey: formKeys.detail(expoId, 'STANDARD', 'PRE'),
    queryFn: () => getForm(expoId, 'STANDARD', 'PRE'),
    retry: false,
    meta: { silent: true },
  });
  const sessions = usePreRegisterSessions(expoId);
  const standard = usePublicPrograms(expoId, 'STANDARD');
  const training = usePublicPrograms(expoId, 'TRAINING');

  const form = preForm.data ?? null;
  const formError =
    preForm.error && getErrorStatus(preForm.error) !== 404
      ? preForm.error
      : null;

  const now = useNow(
    getScheduleBoundaries(
      [...(standard.data ?? []), ...(training.data ?? [])],
      sessions.data ?? [],
      form,
    ),
  );
  const formStatus = form
    ? getFormPeriodStatus(form.startDate, form.endDate, new Date(now))
    : null;

  const preRegisterDescription = form
    ? [
        form.informationText,
        `신청 기간 ${period(form.startDate, form.endDate)}`,
      ]
        .filter(Boolean)
        .join('\n')
    : '신청 기간은 추후 안내합니다.';

  const programRows = (programs: Program[] | undefined, type: ProgramType) =>
    [...(programs ?? [])].sort(byStart).map((program) => {
      const { policy } = program;
      const status = getProgramScheduleStatus(program, now);
      const notes = policy
        ? [
            `신청 ${period(policy.applicationStartedAt, policy.applicationEndedAt)}`,
            ...(canShowProgramCapacity(program)
              ? [`정원 ${policy.capacity.toLocaleString()}명`]
              : []),
          ]
        : [];
      return (
        <ScheduleRow
          key={program.id}
          title={program.title}
          schedule={formatDefinitionSchedule(
            program.startedAt,
            program.endedAt,
          )}
          place={formatProgramPlace(program.place)}
          notes={notes}
          status={status}
          action={
            status === 'OPEN'
              ? {
                  href: `/application/forms/${expoId}/${type === 'STANDARD' ? 'program' : 'training'}`,
                  label: '신청하기',
                }
              : undefined
          }
        />
      );
    });

  return (
    <div className="flex flex-col gap-40 pb-40">
      <p className="break-keep rounded-sm bg-gray-100 px-16 py-12 text-body2r text-gray-500">
        접수 전에도 회차와 신청 기간을 확인할 수 있고, 접수 중인 회차에서 바로
        신청할 수 있습니다. 남은 자리와 신청 자격은 신청할 때 확인합니다.
      </p>

      {showPreRegister && (
        <Section
          title="일반 사전등록"
          description={
            formError
              ? '신청 기간을 불러오지 못했습니다.'
              : preRegisterDescription
          }
          error={sessions.error}
          onRetry={() => {
            sessions.refetch();
            if (formError) preForm.refetch();
          }}
          isLoading={sessions.isLoading || preForm.isLoading}
          isEmpty={sessions.data?.length === 0}
        >
          {[...(sessions.data ?? [])].sort(byStart).map((session) => {
            // 신청서 기간을 못 받았으면 접수 여부를 단정하지 않는다
            const status = getPreRegisterScheduleStatus(
              formError ? null : formStatus,
              session,
              now,
            );
            return (
              <ScheduleRow
                key={session.id}
                title={session.title}
                schedule={formatDefinitionSchedule(
                  session.startedAt,
                  session.endedAt,
                )}
                place={session.place}
                notes={
                  status === 'UPCOMING' && form
                    ? [
                        `${formatFormPeriod(form.startDate)}부터 신청할 수 있습니다.`,
                      ]
                    : []
                }
                status={status}
                action={
                  status === 'OPEN'
                    ? {
                        href: `/application/forms/${expoId}/pre-register?sessionId=${session.id}`,
                        label: '사전등록하기',
                      }
                    : undefined
                }
              />
            );
          })}
        </Section>
      )}

      <Section
        title="일반 프로그램"
        description="사전등록이 확정된 참가자가 신청합니다."
        error={standard.error}
        onRetry={() => standard.refetch()}
        isLoading={standard.isLoading}
        isEmpty={standard.data?.length === 0}
      >
        {programRows(standard.data, 'STANDARD')}
      </Section>

      <Section
        title="교원연수"
        description="교사·예비교사가 신청합니다."
        error={training.error}
        onRetry={() => training.refetch()}
        isLoading={training.isLoading}
        isEmpty={training.data?.length === 0}
      >
        {programRows(training.data, 'TRAINING')}
      </Section>
    </div>
  );
};

export default ApplicationSchedule;
