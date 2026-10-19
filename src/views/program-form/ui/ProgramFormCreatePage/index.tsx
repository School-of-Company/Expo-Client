'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FormBuilder } from '@/features/form-builder';
import {
  ProgramFormBuilderSlotProps,
  ProgramFormCreate,
} from '@/features/program-form';
import {
  DRAFT_QUERY,
  getDraftFormDefaults,
  readProgramDraft,
} from '@/features/registration/schedule';
import { getRegistrationRoutes } from '@/shared/config';
import { DetailHeader, Loading } from '@/shared/ui';
import { Header } from '@/widgets/layout';

const renderBuilder = (props: ProgramFormBuilderSlotProps) => (
  <FormBuilder variant="program" {...props} />
);

type DraftDefaults = ReturnType<typeof getDraftFormDefaults>;

const ProgramFormCreatePage = () => {
  const { expoId } = useParams<{ expoId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const routes = getRegistrationRoutes(expoId);
  // 회차 편집 중에 넘어왔으면 저장 후 그 회차로 돌아가 새 폼을 연결한다
  const returnTo = searchParams.get(DRAFT_QUERY.returnTo);
  const returnsToSchedule = returnTo === 'schedule';

  // 초안은 sessionStorage 에 있어 서버 렌더와 맞추려고 마운트 뒤에 읽는다
  const [draft, setDraft] = useState<{
    title: string;
    defaults: DraftDefaults;
  } | null>();
  useEffect(() => {
    const saved = returnsToSchedule ? readProgramDraft(expoId) : null;
    setDraft(
      saved
        ? {
            title: saved.form.title.trim() || '새 회차',
            defaults: getDraftFormDefaults(saved),
          }
        : null,
    );
  }, [expoId, returnsToSchedule]);

  // 박람회 상세의 폼 생성에서 왔으면 상세로 돌아간다
  const handleBack = () =>
    router.push(
      returnsToSchedule
        ? `${routes.schedule}?${DRAFT_QUERY.resume}=1`
        : returnTo === 'detail'
          ? `/exhibition/detail/${encodeURIComponent(expoId)}`
          : routes.programForms,
    );

  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <div className="w-full max-w-[1000px] space-y-[30px]">
          <DetailHeader
            className="gap-12"
            onBack={handleBack}
            headerTitle="프로그램용 폼 만들기"
          />
          <p className="text-caption1r text-gray-500">
            프로그램·연수 회차의 신청서로 쓰는 폼입니다. 행사 입장 사전·현장
            등록용 폼은 신청관리 폼 탭의 등록용 폼에서 만듭니다.
          </p>
          {draft === undefined ? (
            <Loading />
          ) : (
            <>
              {draft && (
                <p className="rounded-sm border-1 border-solid border-main-600 px-20 py-12 text-body2r text-main-600">
                  저장하면 &apos;{draft.title}&apos; 회차로 돌아가 이 폼을
                  연결합니다. 대상과 응답 기간은 회차 구분·모집 기간에 맞춰
                  채웠습니다.
                </p>
              )}
              <ProgramFormCreate
                expoId={expoId}
                defaultValues={draft?.defaults}
                onCreated={
                  draft
                    ? (formId) =>
                        router.replace(
                          `${routes.schedule}?${DRAFT_QUERY.formId}=${encodeURIComponent(formId)}`,
                        )
                    : undefined
                }
                renderBuilder={renderBuilder}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgramFormCreatePage;
