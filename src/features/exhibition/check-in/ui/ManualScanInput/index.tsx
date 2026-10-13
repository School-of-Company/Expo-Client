'use client';

import { FormEvent, useState } from 'react';
import { Button, Input } from '@/shared/ui';

/**
 * 스캐너가 읽지 못한 QR 값을 직접 넣는 입력창. 입력창에 포커스가 있을 때 스캐너가 보낸 값(+Enter)도
 * 여기로 들어와 같은 방식으로 처리된다
 */
const ManualScanInput = ({
  onSubmit,
}: {
  onSubmit: (value: string) => void;
}) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-12">
      <div className="flex-1">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="QR 값 직접 입력(종이 QR 토큰 등)"
          aria-label="QR 값 직접 입력"
          autoComplete="off"
        />
      </div>
      <div className="w-[100px]">
        <Button type="submit" disabled={!value.trim()}>
          확인
        </Button>
      </div>
    </form>
  );
};

export default ManualScanInput;
