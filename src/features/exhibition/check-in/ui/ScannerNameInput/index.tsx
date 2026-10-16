'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Button, Input } from '@/shared/ui';
import { SCANNER_NAME_MAX_LENGTH } from '../../api/scannerNameHeader';
import {
  isValidScannerName,
  toScannerName,
} from '../../model/useScannerSettings';

/**
 * 이 기기(입구)의 이름. 스캔·간편입장 요청에 함께 보내 스캐너별 처리 건수로 모인다.
 * 비워 두면 이름 없이 예전처럼 처리된다
 */
const ScannerNameInput = ({
  scannerName,
  onSave,
}: {
  scannerName: string;
  onSave: (name: string) => void;
}) => {
  const [value, setValue] = useState(scannerName);

  // 저장값을 늦게 읽거나 박람회가 바뀌면 입력창도 그 값으로 맞춘다
  useEffect(() => {
    setValue(scannerName);
  }, [scannerName]);

  const isInvalid = !isValidScannerName(value);
  const isChanged = toScannerName(value) !== scannerName;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isInvalid) return;
    const name = toScannerName(value);
    onSave(name);
    setValue(name);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex gap-12">
        <div className="flex-1">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="스캐너 이름(예: gate-1)"
            aria-label="스캐너 이름"
            aria-invalid={isInvalid}
            maxLength={SCANNER_NAME_MAX_LENGTH}
            autoComplete="off"
            error={isInvalid}
          />
        </div>
        <div className="w-[100px]">
          <Button type="submit" disabled={isInvalid || !isChanged}>
            저장
          </Button>
        </div>
      </div>
      {isInvalid ? (
        <p role="alert" className="break-keep text-caption1r text-error">
          영문·숫자·기호만 쓸 수 있습니다.
        </p>
      ) : (
        <p className="break-keep text-caption1r text-gray-400">
          {scannerName
            ? `이 브라우저에서 처리한 입·퇴장은 '${scannerName}'(으)로 기록됩니다.`
            : '이름을 저장하지 않으면 스캐너별 집계에 포함되지 않습니다.'}
        </p>
      )}
    </form>
  );
};

export default ScannerNameInput;
