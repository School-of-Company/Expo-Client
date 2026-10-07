'use client';

import { useState } from 'react';
import { ApplicationFormCard } from '@/entities/application';
import { withLoading } from '@/shared/hocs';
import { DetailHeader } from '@/shared/ui';
import { FORM_GROUPS, FormGroup } from '../../constant/formEntries';
import {
  FORM_PERIOD_STATUS_LABEL,
  formatFormPeriod,
  getFormPeriodStatus,
} from '../../model/formPeriodStatus';
import { useApplicationForms } from '../../model/useApplicationForms';
import MyApplicationList from '../MyApplicationList';

const ApplicationFormsContainer = ({ expoId }: { expoId: string }) => {
  const { forms, isLoading } = useApplicationForms(expoId);
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
                  const status = getFormPeriodStatus(
                    form.startDate,
                    form.endDate,
                  );

                  return (
                    <ApplicationFormCard
                      key={key}
                      category={audience}
                      title={form.title}
                      description={form.informationText}
                      period={`${formatFormPeriod(form.startDate)} ~ ${formatFormPeriod(form.endDate)}`}
                      statusLabel={FORM_PERIOD_STATUS_LABEL[status]}
                      isOpen={status === 'OPEN'}
                      buttonLabel={
                        formType === 'survey'
                          ? '응답하기'
                          : `${current.label}하기`
                      }
                      href={
                        // 일반 사전등록은 참가자 선택 페이지로, 나머지는 기존 동적 폼으로
                        key === 'pre-standard'
                          ? `/application/forms/${expoId}/pre-register`
                          : `/application/${expoId}?formType=${formType}&userType=${userType}&applicationType=${applicationType}`
                      }
                    />
                  );
                },
              )}
            </div>
          </>
        )}
      </div>
    ),
  });
};

export default ApplicationFormsContainer;
