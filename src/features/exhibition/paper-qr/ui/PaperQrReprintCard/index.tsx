'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input } from '@/shared/ui';
import { revokeQrToken } from '../../api/qrTokensApi';
import { PAPER_QR_CATEGORIES, PaperQrCategory } from '../../model/constants';
import { paperQrSummaryQueryKey } from '../../model/usePaperQrSummary';

export const MAX_REPRINT_LOOKUP = 120;

export interface PaperQrReprintDraft {
  category: PaperQrCategory;
  start: string;
  count: string;
}

interface PaperQrReprintCardProps {
  expoId: string;
  draft: PaperQrReprintDraft;
  isLookingUp: boolean;
  onDraftChange: (draft: PaperQrReprintDraft) => void;
  onLookup: () => void;
  onRevoked: (code: string) => void;
}

// 구분 3글자-연번-확인 문자 2자리. 확인 문자는 서버가 검사한다
const CODE_PATTERN = /^[A-Z]{3}-\d{4,}-[A-Z0-9]{2}$/;
const CODE_MAX_LENGTH = 20;

const PaperQrReprintCard = ({
  expoId,
  draft,
  isLookingUp,
  onDraftChange,
  onLookup,
  onRevoked,
}: PaperQrReprintCardProps) => {
  const queryClient = useQueryClient();
  const [revokeCode, setRevokeCode] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);

  const handleRevoke = async () => {
    const code = revokeCode.trim().toUpperCase();
    if (!CODE_PATTERN.test(code)) {
      toast.warn('QR 코드 형식을 확인해 주세요. 예: ADT-0001-K7');
      return;
    }
    if (!window.confirm(`${code} QR을 사용 중지할까요?`)) return;
    setIsRevoking(true);
    try {
      await revokeQrToken(expoId, code);
      toast.success(
        `${code} QR을 사용 중지했습니다. 이제 이 QR로 입장할 수 없습니다.`,
      );
      setRevokeCode('');
      onRevoked(code);
      void queryClient.invalidateQueries({
        queryKey: paperQrSummaryQueryKey(expoId),
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'QR을 사용 중지하지 못했습니다.',
      );
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <section className="flex flex-col gap-24 rounded-sm border-1 border-solid border-gray-200 p-24 mobile:p-16">
      <div className="space-y-16">
        <p className="text-body1b text-black">기존 QR 다시 인쇄</p>
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
            <p className="text-caption1r text-gray-600">
              조회 개수(최대 {MAX_REPRINT_LOOKUP})
            </p>
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
        <Button variant="white" onClick={onLookup} disabled={isLookingUp}>
          {isLookingUp ? '조회 중...' : '조회하기'}
        </Button>
      </div>

      <div className="space-y-12 border-t-1 border-solid border-gray-200 pt-24">
        <p className="text-body1b text-black">분실 QR 사용 중지</p>
        <div className="flex gap-8 mobile:flex-col">
          <Input
            placeholder="ADT-0001-K7"
            value={revokeCode}
            maxLength={CODE_MAX_LENGTH}
            onChange={(e) => setRevokeCode(e.target.value)}
          />
          <button
            type="button"
            className="shrink-0 whitespace-nowrap rounded-sm bg-error px-20 py-12 text-body2b text-white disabled:cursor-not-allowed disabled:opacity-40"
            onClick={handleRevoke}
            disabled={revokeCode.trim() === '' || isRevoking}
          >
            {isRevoking ? '처리 중...' : '사용 중지'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default PaperQrReprintCard;
