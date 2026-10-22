'use client';

import { useState } from 'react';
import { FormEditor } from '@/features/form/common';
import { transformFormData } from '@/features/form/common/model/formUtils';
import { transformServerData } from '@/features/form/edit';
import { useRegistrationExpo } from '@/features/registration/common';
import { XMark } from '@/shared/assets/icons';
import { normalizeExpoId } from '@/shared/config';
import { withLoading } from '@/shared/hocs';
import { useExcelDownload } from '@/shared/model';
import { FormValues, SurveyFormRequest } from '@/shared/types/form/create/type';
import { Button } from '@/shared/ui';
import { ModalLayout } from '@/widgets/layout';
import {
  useDeleteSurvey,
  useSaveSurvey,
  useSurvey,
} from '../../model/useSurveyAdmin';

type ParticipationType = 'STANDARD' | 'TRAINEE';

const TABS: { key: ParticipationType; label: string }[] = [
  { key: 'STANDARD', label: '일반 참가자' },
  { key: 'TRAINEE', label: '교원연수자' },
];

const SurveyManager = () => {
  const { expoId } = useRegistrationExpo();
  const [type, setType] = useState<ParticipationType>('STANDARD');
  const [pending, setPending] = useState<SurveyFormRequest | null>(null);

  const { data: survey, isLoading, error } = useSurvey(expoId, type);
  const isEdit = !!survey;
  const save = useSaveSurvey(expoId);
  const remove = useDeleteSurvey(expoId);
  const { mutate: downloadExcel, isPending: isExporting } = useExcelDownload();

  const handleSubmit = (values: FormValues) => {
    const data = transformFormData(
      values,
      type,
      'survey',
      'PRE',
      '',
      '',
    ) as SurveyFormRequest;
    // 응답이 있으면 서버가 문항 변경을 409(SURVEY_ALREADY_ANSWERED)로 거부하므로 저장 전에 알린다
    if (isEdit && survey.totalAnswers > 0) {
      setPending(data);
      return;
    }
    save.mutate({ isEdit, data });
  };

  const handleDelete = () => {
    if (
      window.confirm(
        '만족도 조사와 문항, 공개 링크 응답이 모두 삭제됩니다. 삭제할까요?',
      )
    ) {
      remove.mutate(type);
    }
  };

  return (
    <div className="flex w-full max-w-[816px] flex-col gap-36">
      <div className="flex flex-wrap items-center justify-between gap-16">
        <div role="tablist" className="flex flex-wrap gap-12">
          {TABS.map((tab) => {
            const isActive = tab.key === type;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setType(tab.key)}
                className={`rounded-sm border-1 border-solid px-24 py-12 text-body2b mobile:px-16 mobile:py-8 mobile:text-caption1b ${
                  isActive
                    ? 'border-main-600 bg-main-600 text-white'
                    : 'border-gray-200 bg-white text-gray-400'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-16">
          {/* 공개 설문은 참가 유형과 무관한 행사 공통 1개라 탭·설문 유무와 상관없이 받는다. 설문이 없으면 서버가 404 문구를 준다 */}
          <Button
            variant="white"
            width="120px"
            onClick={() =>
              downloadExcel({
                path: `/excel/public-surveys/${normalizeExpoId(expoId)}`,
              })
            }
            disabled={isExporting || !normalizeExpoId(expoId)}
          >
            {isExporting ? '받는 중...' : '설문 응답 엑셀'}
          </Button>
          {isEdit && (
            <>
              <p className="whitespace-nowrap text-body2r text-gray-600">
                응답 {survey.totalAnswers}건
              </p>
              <Button
                variant="white"
                width="120px"
                onClick={handleDelete}
                disabled={remove.isPending}
              >
                {remove.isPending ? '삭제 중...' : '설문 삭제'}
              </Button>
            </>
          )}
        </div>
      </div>

      {error ? (
        <p className="text-body1r text-gray-500">{error.message}</p>
      ) : (
        withLoading({
          isLoading,
          children: (
            <div className="flex flex-col gap-36">
              {!isEdit && (
                <p className="break-keep text-body2r text-gray-500">
                  아직 만족도 조사가 없습니다. 문항을 추가해 만들어 주세요.
                </p>
              )}

              <FormEditor
                // 설문이 바뀌면(탭 전환, 생성, 삭제) 편집기를 서버 값으로 다시 채운다
                key={`${type}-${survey?.id ?? 'new'}`}
                expoId={expoId}
                type={type}
                mode="survey"
                defaultValues={
                  survey ? transformServerData(survey, 'survey') : undefined
                }
                onSubmit={handleSubmit}
                isLoading={save.isPending}
                isSuccess={false}
                hideBack
              />
            </div>
          ),
        })
      )}

      {pending && (
        <ModalLayout
          label="만족도 조사 수정 확인"
          onClose={() => setPending(null)}
        >
          <div className="flex w-full max-w-[656px] flex-col gap-40 rounded-sm bg-white p-28">
            <div className="space-y-12">
              <div className="flex w-full justify-between">
                <p className="text-h2b mobile:text-body1b">
                  만족도 조사를 수정할까요?
                </p>
                <button
                  type="button"
                  onClick={() => setPending(null)}
                  aria-label="닫기"
                  className="-m-10 flex h-[44px] w-[44px] shrink-0 items-center justify-center"
                >
                  <XMark />
                </button>
              </div>
              <p className="break-keep text-body2r text-gray-500">
                이미 {survey?.totalAnswers}건의 응답이 있어 문항은 바꿀 수
                없습니다. 제목·안내 문구·경품 추첨 설정만 수정할 수 있으며,
                문항을 추가·삭제·변경했다면 저장되지 않습니다.
              </p>
            </div>
            <div className="flex items-center gap-12">
              <Button variant="white" onClick={() => setPending(null)}>
                취소
              </Button>
              <Button
                onClick={() => {
                  save.mutate({ isEdit: true, data: pending });
                  setPending(null);
                }}
              >
                수정하기
              </Button>
            </div>
          </div>
        </ModalLayout>
      )}
    </div>
  );
};

export default SurveyManager;
