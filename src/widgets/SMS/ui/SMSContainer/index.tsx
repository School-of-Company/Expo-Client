'use client';

import { useState } from 'react';
import { SMSHeader, TextArea } from '@/entities/SMS';
import { Button } from '@/shared/ui';

export default function Write() {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');

  return (
    <div className="relative mx-auto flex w-full max-w-[792px] flex-1 flex-col pb-5">
      <div className="flex flex-1 flex-col gap-[62px]">
        <SMSHeader />
        <div className="space-y-[40px]">
          <TextArea
            title="제목"
            placeholder="제목 입력"
            maxLength={30}
            text="text-h1"
            state={title}
            setState={setTitle}
            row={1}
          />
          <TextArea
            title="내용"
            placeholder="내용 입력"
            maxLength={1000}
            text="text-caption2"
            state={content}
            setState={setContent}
            row={12}
          />
        </div>
        <div className="w-full mobile:px-5">
          <Button text="보내기" />
        </div>
      </div>
    </div>
  );
}
