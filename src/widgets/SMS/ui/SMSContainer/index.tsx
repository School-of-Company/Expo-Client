'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Button, PageHeader } from '@/shared/ui';
import TextArea from '@/shared/ui/TextArea';
import { sendSMS } from '../../api/sendSMS';

interface FormData {
  title: string;
  content: string;
}

export default function Write() {
  const queryClient = useQueryClient();
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

  const mutation = useMutation({
    mutationFn: (data: FormData) => sendSMS({ ...data, id, authority }),
    onSuccess: () => {
      toast.success('문자가 성공적으로 전송되었습니다.');

      queryClient.invalidateQueries({ queryKey: ['messages', id] });
    },
    onError: (error) => {
      toast.error(`문자 전송 실패: ${error.message}`);
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data, {
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
          <Button disabled={isSubmitting || mutation.isPending} text="보내기" />
        </div>
      </div>
    </form>
  );
}
