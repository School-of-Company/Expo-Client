'use client';

import { useState } from 'react';
import { ApplicationFormCard } from '@/entities/application';
import { withLoading } from '@/shared/hocs';
import { DetailHeader } from '@/shared/ui';
import { FORM_GROUPS, FormGroup } from '../../constant/formEntries';
import { useFieldRelease } from '../../model/fieldRelease';
import {
  FORM_PERIOD_STATUS_LABEL,
  formatFormPeriod,
  getFormPeriodStatus,
} from '../../model/formPeriodStatus';
import { useApplicationForms } from '../../model/useApplicationForms';
import MyApplicationList from '../MyApplicationList';

const ApplicationFormsContainer = ({ expoId }: { expoId: string }) => {
  const { forms: allForms, isLoading: isFormsLoading } =
    useApplicationForms(expoId);
  const field = useFieldRelease(expoId);
  const isLoading = isFormsLoading || field.isLoading;
  // 현장 등록 폼은 행사 시작일 00:00(KST)부터 사용자 목록에 노출한다
  const forms = allForms.filter(
    (entry) => entry.group !== 'FIELD' || field.released,
  );
  const [selected, setSelected] = useState<FormGroup | null>(null);

  // 폼이 하나라도 있는 그룹만 탭으로 노출
  const groups = FORM_GROUPS.filter((group) =>
    forms.some((entry) => entry.group === group.key),
  );
  const current =
    groups.find((group) => group.key === selected) ?? groups[0] ?? null;
  const currentForms = forms.filter((entry) => entry.group === current?.key);

  return withLoading({
    isLoading,
    children: (
      <div className="flex w-full max-w-[816px] flex-1 flex-col gap-30 overflow-y-auto">
        <div className="mt-30">
          <DetailHeader headerTitle="신청 폼 모음" />
        </div>

        <MyApplicationList expoId={expoId} />

        {!current ? (
          <p className="flex flex-1 items-center justify-center text-body1r text-gray-500 mobile:text-body2r">
            신청할 수 있는 폼이 없습니다
          </p>
        ) : (
          <>
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

            <div className="flex flex-col gap-16">
              {currentForms.map(
                ({
                  key,
                  audience,
                  formType,
                  userType,
                  applicationType,
                  form,
                }) => {
                  // 설문에는 신청 기간이 없다
                  const hasPeriod = 'startDate' in form;
                  const status = hasPeriod
                    ? getFormPeriodStatus(form.startDate, form.endDate)
                    : 'OPEN';

                  return (
                    <ApplicationFormCard
                      key={key}
                      category={audience}
                      title={form.title}
                      description={form.informationText}
                      period={
                        hasPeriod
                          ? `${formatFormPeriod(form.startDate)} ~ ${formatFormPeriod(form.endDate)}`
                          : '-'
                      }
                      statusLabel={FORM_PERIOD_STATUS_LABEL[status]}
                      isOpen={status === 'OPEN'}
                      buttonLabel={
                        formType === 'survey'
                          ? '응답하기'
                          : `${current.label}하기`
                      }
                      href={
                        // 일반 사전등록은 참가자 선택 페이지로, 연수 사전신청은 프로그램별 신청으로, 나머지는 기존 동적 폼으로
                        key === 'pre-standard'
                          ? `/application/forms/${expoId}/pre-register`
                          : key === 'pre-trainee'
                            ? `/application/forms/${expoId}/training`
                            : `/application/${expoId}?formType=${formType}&userType=${userType}&applicationType=${applicationType}`
                      }
                    />
                  );
                },
              )}
              {current.key === 'PRE' && (
                <ApplicationFormCard
                  category="일반"
                  title="프로그램 신청"
                  description="사전등록이 확정된 참가자가 일반 프로그램을 골라 신청합니다."
                  period="프로그램별 신청 기간"
                  // 회차마다 기간·마감이 달라 이 카드에서 접수 가능 여부를 단정하지 않는다
                  statusLabel="프로그램·회차 확인"
                  isOpen
                  buttonLabel="프로그램 신청하기"
                  href={`/application/forms/${expoId}/program`}
                />
              )}
            </div>
          </>
        )}
      </div>
    ),
  });
};

export default ApplicationFormsContainer;
