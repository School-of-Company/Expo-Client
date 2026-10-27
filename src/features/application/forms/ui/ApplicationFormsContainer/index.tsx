'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { withLoading } from '@/shared/hocs';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import { FORM_GROUPS, FormGroup } from '../../constant/formEntries';
import { useFieldRelease } from '../../model/fieldRelease';
import {
  formatFormPeriod,
  getFormPeriodStatus,
} from '../../model/formPeriodStatus';
import { useApplicationForms } from '../../model/useApplicationForms';
import { useNow } from '../../model/useNow';
import { useParticipantExpoDetail } from '../../model/useParticipantExpoDetail';
import ApplicationLanding from '../ApplicationLanding';
import ApplicationSchedule from '../ApplicationSchedule';
import MyApplicationList from '../MyApplicationList';
import ScheduleRow from '../ScheduleRow';

const VIEWS = [
  { value: 'list', label: '신청 목록' },
  { value: 'my', label: '내 신청' },
] as const;

type View = 'home' | (typeof VIEWS)[number]['value'];

const isView = (value?: string): value is View =>
  value === 'home' || VIEWS.some((view) => view.value === value);

const ApplicationFormsContainer = ({
  expoId,
  isMainExpo,
  initialView,
  initialTab,
}: {
  expoId: string;
  /** 현재 박람회(MAIN_EXPO_ID)인지. 사전등록 탭에 안내 문구를 붙일지 정한다 */
  isMainExpo?: boolean;
  /** `?view=my|list` 로 들어오면 그 탭을 바로 연다. 신청 완료 화면의 "내 신청·QR 보기"가 쓴다 */
  initialView?: string;
  /** `?tab=registration|program|training` 로 들어오면 신청 목록의 그 탭을 연다. 신청 화면에서 뒤로 올 때 보던 탭을 지키려고 쓴다 */
  initialTab?: string;
}) => {
  const { forms: allForms, isLoading: isFormsLoading } =
    useApplicationForms(expoId);
  const field = useFieldRelease(expoId);
  // 처음 한 번만 로딩으로 막는다. 이미 보이는 화면의 조회가 다시 시작돼도 화면을 지웠다 다시 그리지 않는다
  // (없는 폼 조회를 다시 받는 동안 화면이 사라졌다 돌아오면 같은 조회가 끝없이 반복된다)
  const isInitialLoading = isFormsLoading || field.isLoading;
  const [hasLoaded, setHasLoaded] = useState(false);
  useEffect(() => {
    if (!isInitialLoading) setHasLoaded(true);
  }, [isInitialLoading]);
  const isLoading = isInitialLoading && !hasLoaded;
  // 행사 시작일 00:00(KST)부터 일반 사전등록은 숨기고 현장 등록을 노출한다. 교원연수·프로그램 신청 등 나머지 PRE 항목은 유지한다
  const forms = allForms.filter((entry) =>
    entry.group === 'FIELD'
      ? field.released
      : entry.key !== 'pre-standard' || !field.released,
  );
  const {
    data: expo,
    isLoading: isExpoLoading,
    error: expoError,
  } = useParticipantExpoDetail(expoId);
  const [view, setView] = useState<View>(
    isView(initialView) ? initialView : 'home',
  );
  const [selected, setSelected] = useState<FormGroup | null>(null);

  // 신청 화면에서 뒤로 오면 이 주소로 돌아오므로, 보던 화면과 탭을 주소에 남겨 둔다
  const changeView = (next: View) => {
    setView(next);
    const url = new URL(window.location.href);
    url.searchParams.set('view', next);
    if (next !== 'list') url.searchParams.delete('tab');
    window.history.replaceState(window.history.state, '', url);
  };

  // 사전등록 탭은 회차·프로그램 일정이라 신청서가 없어도 노출하고, 나머지는 폼이 하나라도 있는 그룹만 노출.
  // 행사가 시작되면 현장등록을 기본 탭으로 앞에 두고, 사전등록 탭은 남은 프로그램·연수 일정만 보여 준다
  const groups = FORM_GROUPS.filter(
    (group) =>
      group.key === 'PRE' || forms.some((entry) => entry.group === group.key),
  )
    .map((group) =>
      field.released && group.key === 'PRE'
        ? { ...group, label: '프로그램·연수' }
        : group,
    )
    .sort(
      (a, b) =>
        Number(field.released && b.key === 'FIELD') -
        Number(field.released && a.key === 'FIELD'),
    );
  const current =
    groups.find((group) => group.key === selected) ?? groups[0] ?? null;
  const currentForms = forms.filter((entry) => entry.group === current?.key);
  // 목록을 켜둔 채 신청 시작·마감 시각이 지나도 상태와 신청 링크를 바꾼다(#749)
  const now = useNow(
    currentForms.flatMap(({ form }) =>
      [
        new Date(form.startDate).getTime(),
        new Date(form.endDate).getTime(),
      ].filter(Number.isFinite),
    ),
  );

  // 없는 박람회(404)는 로딩을 끝내고 안내한다. 일시적인 네트워크·서버 오류는 아래 화면의 다시 시도로 구분한다
  if (getErrorStatus(expoError) === 404)
    return (
      <div className="mx-auto flex w-full max-w-[816px] flex-1 flex-col items-center justify-center gap-16 text-center">
        <p className="text-h3b text-black">박람회를 찾을 수 없습니다</p>
        <p className="break-keep text-body2r text-gray-500">
          주소가 잘못되었거나 삭제된 박람회입니다. 안내받은 링크를 다시 확인해
          주세요.
        </p>
        <Link
          href="/"
          className="rounded-sm bg-main-600 px-24 py-12 text-body2b text-white"
        >
          박람회 목록으로
        </Link>
      </div>
    );

  if (view === 'home') {
    return withLoading({
      isLoading: isExpoLoading,
      children: (
        <div className="mx-auto flex w-full max-w-[816px] flex-1 flex-col">
          <ApplicationLanding
            expo={expo}
            isFieldReleased={field.released}
            onApply={() => changeView('list')}
            onMy={() => changeView('my')}
          />
        </div>
      ),
    });
  }

  return withLoading({
    isLoading,
    children: (
      <div className="mx-auto flex w-full max-w-[816px] flex-1 flex-col gap-30 overflow-y-auto">
        <button
          type="button"
          onClick={() => changeView('home')}
          className="mt-30 self-start text-body2r text-gray-500"
        >
          ← 박람회 안내
        </button>
        <div role="tablist" className="flex justify-center gap-[18px]">
          {VIEWS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={view === value}
              onClick={() => changeView(value)}
              className={`text-h2b mobile:text-h3b ${view === value ? 'text-black' : 'text-gray-500'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {field.isError && view !== 'my' && (
          <div className="flex flex-col gap-12">
            <p role="alert" className="break-keep text-body2r text-error">
              행사 정보를 불러오지 못해 현장 등록 공개 여부를 확인할 수
              없습니다.
            </p>
            <button
              type="button"
              onClick={() => field.refetch()}
              className="w-full rounded-sm border-1 border-solid border-main-600 px-24 py-14 text-body2b text-main-600"
            >
              다시 시도
            </button>
          </div>
        )}

        {view === 'my' ? (
          <MyApplicationList expoId={expoId} />
        ) : !current ? (
          <p className="flex flex-1 items-center justify-center text-body1r text-gray-500 mobile:text-body2r">
            신청할 수 있는 폼이 없습니다
          </p>
        ) : (
          <>
            {groups.length > 1 && (
              <div role="tablist" className="flex flex-wrap gap-12">
                {groups.map((group) => {
                  const isActive = group.key === current.key;
                  return (
                    <button
                      key={group.key}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setSelected(group.key)}
                      className={`rounded-sm border-1 border-solid px-24 py-12 text-body2b mobile:px-16 mobile:py-8 mobile:text-caption1b ${
                        isActive
                          ? 'border-main-600 bg-main-600 text-white'
                          : 'border-gray-200 bg-white text-gray-400'
                      }`}
                    >
                      {group.label}
                    </button>
                  );
                })}
              </div>
            )}

            {current.key === 'PRE' ? (
              <ApplicationSchedule
                expoId={expoId}
                showGuide={isMainExpo}
                showPreRegister={!field.released}
                initialTab={initialTab}
              />
            ) : (
              <ul className="flex flex-col gap-12">
                {currentForms.map(
                  ({
                    key,
                    audience,
                    formType,
                    userType,
                    applicationType,
                    form,
                  }) => {
                    const status = getFormPeriodStatus(
                      form.startDate,
                      form.endDate,
                      new Date(now),
                    );

                    return (
                      <ScheduleRow
                        key={key}
                        category={audience}
                        title={form.title}
                        schedule={`신청 기간 ${formatFormPeriod(form.startDate)} ~ ${formatFormPeriod(form.endDate)}`}
                        place={null}
                        notes={
                          form.informationText ? [form.informationText] : []
                        }
                        status={status}
                        action={
                          status === 'OPEN'
                            ? {
                                label: `${current.label}하기`,
                                href: `/application/${expoId}?formType=${formType}&userType=${userType}&applicationType=${applicationType}`,
                              }
                            : undefined
                        }
                      />
                    );
                  },
                )}
              </ul>
            )}
          </>
        )}
      </div>
    ),
  });
};

export default ApplicationFormsContainer;
