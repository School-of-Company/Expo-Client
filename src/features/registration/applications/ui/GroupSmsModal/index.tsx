'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { XMark } from '@/shared/assets/icons';
import { CheckBoxIcon, CheckedBoxIcon } from '@/shared/assets/svg';
import { Button } from '@/shared/ui';
import TextArea from '@/shared/ui/TextArea';
import {
  ApplicationRow,
  applySmsTemplate,
  dedupeByContact,
  SMS_PLACEHOLDERS,
  SMS_TEMPLATES,
  useSendGroupSms,
} from '../../../common';

type Target = 'SELECTED' | 'FILTERED';

interface GroupSmsModalProps {
  selectedRows: ApplicationRow[];
  filteredRows: ApplicationRow[];
  onClose: () => void;
  onSent: () => void;
}

const SMS_MAX_LENGTH = 1000;

const GroupSmsModal = ({
  selectedRows,
  filteredRows,
  onClose,
  onSent,
}: GroupSmsModalProps) => {
  const [target, setTarget] = useState<Target>(
    selectedRows.length > 0 ? 'SELECTED' : 'FILTERED',
  );
  const { register, watch, setValue, handleSubmit } = useForm<{
    content: string;
  }>({ defaultValues: { content: SMS_TEMPLATES[1].content } });
  const content = watch('content');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const targetRows = target === 'SELECTED' ? selectedRows : filteredRows;
  const recipients = dedupeByContact(targetRows);

  const { mutate: sendGroupSms, isPending } = useSendGroupSms(() => {
    onSent();
    onClose();
  });

  const onSubmit = ({ content: message }: { content: string }) => {
    if (recipients.length === 0) {
      toast.error('받는 사람이 없습니다.');
      return;
    }
    if (!window.confirm(`${recipients.length}명에게 문자를 보낼까요?`)) return;
    sendGroupSms({
      applicationIds: recipients.map(({ id }) => id),
      content: message,
    });
  };

  const targetOptions: { value: Target; label: string; count: number }[] = [
    { value: 'SELECTED', label: '선택한 신청자', count: selectedRows.length },
    {
      value: 'FILTERED',
      label: '현재 검색 결과 전체',
      count: filteredRows.length,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center px-[18px]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex max-h-[90vh] w-full max-w-[792px] flex-col gap-[40px] overflow-y-auto rounded-sm bg-white px-[40px] py-[36px] mobile:px-20"
      >
        <div className="flex items-center">
          <p className="flex-grow text-center text-h2r text-black mobile:text-body1r">
            문자 보내기
          </p>
          <button type="button" onClick={onClose} aria-label="닫기">
            <XMark />
          </button>
        </div>

        <div className="space-y-[10px]">
          <p className="text-h3b text-black">받는 사람</p>
          <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
            {targetOptions.map(({ value, label, count }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTarget(value)}
                className={`flex items-center gap-12 rounded-sm border-1 border-solid px-16 py-12 text-left duration-200 ${
                  target === value ? 'border-main-600' : 'border-gray-200'
                }`}
              >
                {target === value ? <CheckedBoxIcon /> : <CheckBoxIcon />}
                <span className="text-body2r text-black">{label}</span>
                <span className="ml-auto text-body2r text-main-600">
                  {count}
                </span>
              </button>
            ))}
          </div>
          <p className="text-caption1r text-gray-500">
            같은 연락처는 1번만 보냅니다. 개인 연락처가 없으면 인증에 사용한
            대표 번호로 보냅니다.
          </p>
        </div>

        <div className="space-y-[10px]">
          <p className="text-h3b text-black">템플릿</p>
          <div className="flex flex-wrap gap-8">
            {SMS_TEMPLATES.map((template) => (
              <button
                key={template.label}
                type="button"
                onClick={() => setValue('content', template.content)}
                className="rounded-sm border-1 border-solid border-gray-200 px-12 py-8 text-body2r text-gray-500 duration-200 hover:border-main-600 hover:text-main-600"
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-[10px]">
          <TextArea
            title="내용"
            placeholder="내용 입력"
            maxLength={SMS_MAX_LENGTH}
            registration={register('content', {
              required: '내용을 입력해주세요.',
            })}
            row={6}
            value={content}
          />
          <p className="text-caption1r text-gray-500">
            {SMS_PLACEHOLDERS.join(' ')} 를 쓰면 받는 사람 정보로 바뀝니다.
          </p>
        </div>

        {recipients[0] && content && (
          <div className="space-y-[10px]">
            <p className="text-h3b text-black">미리보기</p>
            <p className="whitespace-pre-wrap rounded-sm border-1 border-solid border-gray-200 px-16 py-12 text-body2r text-gray-500">
              {applySmsTemplate(content, recipients[0])}
            </p>
          </div>
        )}

        <Button type="submit" disabled={isPending || recipients.length === 0}>
          {isPending ? '보내는 중...' : `${recipients.length}명에게 보내기`}
        </Button>
      </form>
    </div>
  );
};

export default GroupSmsModal;
