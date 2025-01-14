'use client';

import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button, PageHeader } from '@/shared/ui';
import TextArea from '@/shared/ui/TextArea';
import { useSendSMS } from '../../model/useSendSMS';

interface FormData {
  title: string;
  content: string;
}

export default function Write() {
  const { id, authority } = useParams<{
    id: string;
    authority: 'STANDARD' | 'TRAINEE';
  }>();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<FormData>();

  const sendSMSMutation = useSendSMS(id, authority);

  const onSubmit = (data: FormData) => {
    sendSMSMutation.mutate(data, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="relative mx-auto flex w-full max-w-[792px] flex-1 flex-col pb-5"
    >
      <div className="flex flex-1 flex-col gap-[62px]">
        <PageHeader title="문자 보내기" />
        <div className="space-y-[40px]">
          <TextArea
            title="제목"
            placeholder="제목 입력"
            maxLength={30}
            registration={register('title', {
              required: '제목을 입력해주세요.',
            })}
            row={1}
          />
          <TextArea
            title="내용"
            placeholder="내용 입력"
            maxLength={1000}
            registration={register('content', {
              required: '내용을 입력해주세요.',
            })}
            row={12}
          />
        </div>
        <div className="w-full mobile:px-5">
          <Button
            disabled={isSubmitting || sendSMSMutation.isPending}
            text="보내기"
          />
        </div>
      </div>
    </form>
  );
}
