'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Input, MockDataBadge } from '@/shared/ui';
import { PAPER_QR_MOCK_ISSUE } from '../../mock/paperQrMock';
import { PAPER_QR_CATEGORIES, PaperQrCategory } from '../../model/constants';

export const MAX_REPRINT_LOOKUP = 120;

export interface PaperQrReprintDraft {
  category: PaperQrCategory;
  start: string;
  count: string;
}

interface PaperQrReprintCardProps {
  draft: PaperQrReprintDraft;
  onDraftChange: (draft: PaperQrReprintDraft) => void;
  onLookup: () => void;
}

const CODE_PATTERN = /^(ADT|CHD|GEN)-\d{4}-[A-Z0-9]{2}$/;

const PaperQrReprintCard = ({
  draft,
  onDraftChange,
  onLookup,
}: PaperQrReprintCardProps) => {
  const [revokeCode, setRevokeCode] = useState('');

  const handleRevoke = () => {
    const code = revokeCode.trim().toUpperCase();
    if (!CODE_PATTERN.test(code)) {
      toast.warn('QR 코드 형식을 확인해 주세요. 예: ADT-0001-K7');
      return;
    }
    if (!window.confirm(`${code} QR을 사용 중지할까요?`)) return;
    // 서버 연결 전이라 실제로 막지 않는다. Expo-Attendance-Server#132
    toast.info(
      '예시 화면입니다. 서버가 연결되면 이 QR은 입장할 수 없게 됩니다.',
    );
    setRevokeCode('');
  };

  return (
    <section className="flex flex-col gap-24 rounded-sm border-1 border-solid border-gray-200 p-24 mobile:p-16">
      <div className="space-y-16">
        <div className="space-y-8">
          <div className="flex items-center gap-8">
            <p className="text-h3b text-black">기존 QR 다시 인쇄</p>
            <MockDataBadge issue={PAPER_QR_MOCK_ISSUE} />
          </div>
          <p className="break-keep text-caption1r text-gray-500">
            이미 발급한 QR을 연번으로 찾아 다시 인쇄합니다. 한 번에 최대{' '}
            {MAX_REPRINT_LOOKUP}장까지 조회할 수 있습니다.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-12 mobile:grid-cols-1">
          <label className="space-y-8">
            <p className="text-caption1r text-gray-600">유형</p>
            <select
              className="h-[50px] w-full rounded-sm border-1 border-solid border-gray-200 bg-white px-12 text-body2r text-black"
              value={draft.category}
              onChange={(e) =>
                onDraftChange({
                  ...draft,
                  category: e.target.value as PaperQrCategory,
                })
              }
            >
              {PAPER_QR_CATEGORIES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="space-y-8">
            <p className="text-caption1r text-gray-600">시작 연번</p>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="1"
              value={draft.start}
              onChange={(e) =>
                onDraftChange({ ...draft, start: e.target.value })
              }
            />
          </div>
          <div className="space-y-8">
            <p className="text-caption1r text-gray-600">조회 개수</p>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_REPRINT_LOOKUP}
              placeholder="30"
              value={draft.count}
              onChange={(e) =>
                onDraftChange({ ...draft, count: e.target.value })
              }
            />
          </div>
        </div>
        <button
          type="button"
          className="w-full rounded-sm border-1 border-solid border-main-600 py-12 text-body2b text-main-600"
          onClick={onLookup}
        >
          조회하기
        </button>
      </div>

      <div className="space-y-12 border-t-1 border-solid border-gray-200 pt-24">
        <div className="space-y-8">
          <div className="flex items-center gap-8">
            <p className="text-body2b text-black">분실 QR 무효화</p>
            <MockDataBadge issue={PAPER_QR_MOCK_ISSUE} />
          </div>
          <p className="break-keep text-caption1r text-gray-500">
            잃어버린 QR의 코드를 입력하면 그 QR로는 입장할 수 없게 됩니다.
          </p>
        </div>
        <div className="flex gap-8 mobile:flex-col">
          <Input
            placeholder="ADT-0001-K7"
            value={revokeCode}
            onChange={(e) => setRevokeCode(e.target.value)}
          />
          <button
            type="button"
            className="shrink-0 whitespace-nowrap rounded-sm bg-error px-20 py-12 text-body2b text-white disabled:cursor-not-allowed disabled:opacity-40"
            onClick={handleRevoke}
            disabled={revokeCode.trim() === ''}
          >
            사용 중지
          </button>
        </div>
      </div>
    </section>
  );
};

export default PaperQrReprintCard;
