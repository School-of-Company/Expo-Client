'use client';

import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { SendSmSData } from '@/shared/types/sms';
import { Button, PageHeader } from '@/shared/ui';
import TextArea from '@/shared/ui/TextArea';
import { useSendSMS } from '../../model/useSendSMS';

export default function Write() {
  const { id, authority } = useParams<{
    id: string;
    authority: 'STANDARD' | 'TRAINEE';
  }>();

  const { register, handleSubmit, watch, reset } = useForm<SendSmSData>();

  const { mutate: sendSmS, isPending } = useSendSMS(id, authority);

  const onSubmit = (data: SendSmSData) => {
    sendSmS(data);
    reset();
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
            value={watch('title')}
          />
          <TextArea
            title="내용"
            placeholder="내용 입력"
            maxLength={1000}
            registration={register('content', {
              required: '내용을 입력해주세요.',
            })}
            row={12}
            value={watch('content')}
          />
        </div>
        <div className="w-full mobile:px-5">
          <Button type="submit" disabled={isPending}>
            보내기
          </Button>
        </div>
      </div>
    </form>
  );
}
