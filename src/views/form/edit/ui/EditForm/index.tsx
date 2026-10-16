'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useDeleteFormMutation } from '@/entities/form';
import { FormEditor } from '@/features/form/common';
import {
  transformServerData,
  useEditFormMutation,
  useGetEditForm,
} from '@/features/form/edit';
import { XMark } from '@/shared/assets/icons';
import { withLoading } from '@/shared/hocs';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import { useExpoDetail } from '@/shared/queries';
import { ApplicationType } from '@/shared/types/exhibition/type';
import { Button } from '@/shared/ui';
import { Header, ModalLayout } from '@/widgets/layout';

const EditForm = ({ id }: { id: string }) => {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as 'STANDARD' | 'TRAINEE';
  const mode = searchParams.get('mode') as 'application' | 'survey';
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const application = (searchParams.get('applicationType') ||
    'PRE') as ApplicationType;
  const { data, isLoading } = useGetEditForm(id, type, mode, application);
  const {
    handleSubmitForm,
    isApplicationPending,
    isSurveyPending,
    isApplicationSuccess,
    isSurveySuccess,
  } = useEditFormMutation(
    id,
    type,
    mode,
    application,
    startDate || '',
    endDate || '',
  );

  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: expo } = useExpoDetail(id);
  const remove = useDeleteFormMutation(id);

  const [confirming, setConfirming] = useState(false);
  const audience = type === 'TRAINEE' ? '연수자' : '참가자';
  const kind = application === 'FIELD' ? '현장등록' : '사전등록';

  // 신청 폼만 지운다. 설문은 만족도 조사 관리 화면에서 지운다
  const handleDelete = () => {
    const done = () => {
      queryClient.removeQueries({
        queryKey: ['getApplicationForm', id, type, application],
      });
      queryClient.invalidateQueries({ queryKey: ['applicationFormEntry', id] });
      router.replace(`/exhibition/detail/${id}`);
    };
    remove.mutate(
      { participantType: type, applicationType: application },
      {
        onSuccess: () => {
          toast.success('신청 폼을 삭제했습니다.');
          done();
        },
        onError: (error) => {
          // 이미 지워진 폼이다. 오류로 두지 말고 화면을 삭제된 상태에 맞춘다
          if (getErrorStatus(error) === 404) {
            toast.info('이미 삭제된 폼입니다.');
            done();
            return;
          }
          setConfirming(false);
          toast.error(error.message);
        },
      },
    );
  };

  const defaultValues = data ? transformServerData(data, mode) : undefined;

  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      {withLoading({
        isLoading,
        children: (
          <div className="flex flex-1 flex-col items-center gap-16 overflow-hidden p-16">
            {mode === 'application' && data && (
              <div className="flex w-full max-w-[816px] justify-end">
                <Button
                  variant="white"
                  width="120px"
                  onClick={() => setConfirming(true)}
                >
                  폼 삭제
                </Button>
              </div>
            )}
            <FormEditor
              expoId={id}
              type={type}
              mode={mode}
              defaultValues={defaultValues}
              onSubmit={handleSubmitForm}
              isLoading={isApplicationPending || isSurveyPending}
              isSuccess={isApplicationSuccess || isSurveySuccess}
            />
          </div>
        ),
      })}
      {confirming && (
        <ModalLayout
          label="폼 삭제 확인"
          onClose={() => setConfirming(false)}
          canClose={!remove.isPending}
        >
          <div className="flex w-full max-w-[656px] flex-col gap-40 rounded-sm bg-white p-28">
            <div className="space-y-12">
              <div className="flex w-full justify-between">
                <p className="text-h2b mobile:text-body1b">폼을 삭제할까요?</p>
                <button
                  type="button"
                  disabled={remove.isPending}
                  onClick={() => setConfirming(false)}
                  aria-label="닫기"
                  className="-m-10 flex h-[44px] w-[44px] shrink-0 items-center justify-center"
                >
                  <XMark />
                </button>
              </div>
              <p className="break-keep text-body2r text-gray-500">
                {`'${expo?.title ?? '이 박람회'}'의 ${audience} ${kind} 신청 폼과 입력 항목이 모두 삭제됩니다. 되돌릴 수 없습니다.`}
              </p>
            </div>
            <div className="flex items-center gap-12">
              <Button
                variant="white"
                disabled={remove.isPending}
                onClick={() => setConfirming(false)}
              >
                취소
              </Button>
              <Button onClick={handleDelete} disabled={remove.isPending}>
                {remove.isPending ? '삭제 중...' : '삭제하기'}
              </Button>
            </div>
          </div>
        </ModalLayout>
      )}
    </div>
  );
};

export default EditForm;
