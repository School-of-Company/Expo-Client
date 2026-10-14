'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, MockDataBadge } from '@/shared/ui';
import {
  getPaperQrMockData,
  PAPER_QR_MOCK_ISSUE,
} from '../../mock/paperQrMock';
import {
  getCategoryLabel,
  MAX_TOKENS_PER_ISSUE,
  MAX_TOKENS_PER_REQUEST,
  PAPER_QR_CATEGORIES,
  PaperQrCategory,
} from '../../model/constants';
import {
  issuePaperQrTokens,
  PaperQrBatch,
} from '../../model/issuePaperQrTokens';

interface PaperQrIssueCardProps {
  expoId: string;
  // 출력 목록에 아직 방금 발급한 QR이 있으면 덮기 전에 묻는다
  hasIssued: boolean;
  onIssued: (batches: PaperQrBatch[]) => void;
}

const toCount = (value: string) => {
  const count = Number(value);
  return Number.isInteger(count) && count > 0 ? count : 0;
};

const PaperQrIssueCard = ({
  expoId,
  hasIssued,
  onIssued,
}: PaperQrIssueCardProps) => {
  const [counts, setCounts] = useState<Record<PaperQrCategory, string>>({
    ADULT: '',
    CHILD: '',
    GENERAL: '',
  });
  const [isIssuing, setIsIssuing] = useState(false);
  // 일부만 발급되고 실패했을 때 화면에 남겨 두는 안내
  const [partialNotice, setPartialNotice] = useState<string | null>(null);

  const issueStatus = getPaperQrMockData()
    .issueStatus.map(
      ({ category, activeCount }) =>
        `${getCategoryLabel(category)} ACTIVE ${activeCount}`,
    )
    .join(' · ');

  const requested = PAPER_QR_CATEGORIES.map(({ value }) => ({
    category: value,
    count: toCount(counts[value]),
  }));
  const total = requested.reduce((sum, { count }) => sum + count, 0);
  const isOverLimit = total > MAX_TOKENS_PER_ISSUE;

  const handleIssue = async () => {
    if (total === 0) {
      toast.warn('발급할 장수를 입력해 주세요.');
      return;
    }
    if (isOverLimit) {
      toast.warn(`한 번에 ${MAX_TOKENS_PER_ISSUE}장까지 발급할 수 있습니다.`);
      return;
    }
    if (
      hasIssued &&
      !window.confirm(
        '방금 발급한 QR 출력 목록이 새로 발급한 QR로 바뀝니다. 이전 QR은 다시 볼 수 없습니다. 인쇄를 마쳤다면 계속해 주세요.',
      )
    ) {
      return;
    }
    setIsIssuing(true);
    setPartialNotice(null);
    try {
      const { batches, error } = await issuePaperQrTokens(expoId, requested);
      const issued = batches.reduce(
        (sum, { tokens }) => sum + tokens.length,
        0,
      );
      if (error) {
        if (issued === 0) {
          toast.error(error.message);
          return;
        }
        // 이미 발급된 토큰은 유효하므로 버리지 않고 출력 목록에 둔다
        const notice = `요청한 ${total}장 중 ${issued}장만 발급되었습니다. 발급된 QR은 인쇄하고, 나머지만 다시 발급해 주세요.`;
        setPartialNotice(notice);
        toast.error(`${error.message} ${notice}`);
      } else {
        toast.success(
          `종이 QR ${total}장을 발급했습니다. 출력 목록에서 인쇄해 주세요.`,
        );
      }
      onIssued(batches);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '종이 QR 발급에 실패했습니다.',
      );
    } finally {
      setIsIssuing(false);
    }
  };

  return (
    <section className="flex flex-col gap-20 rounded-sm border-1 border-solid border-gray-200 p-24 mobile:p-16">
      <div className="space-y-8">
        <p className="text-h3b text-black">새 QR 발급</p>
        <p className="break-keep text-caption1r text-gray-500">
          한 장은 하루에 한 번 입장할 수 있습니다. 발급한 QR은 다시 볼 수 없으니
          발급 후 출력 목록에서 바로 인쇄해 주세요.
        </p>
        <div className="flex flex-wrap items-center gap-8">
          <p className="text-caption1r text-gray-600">
            현재 발급 현황 {issueStatus}
          </p>
          <MockDataBadge issue={PAPER_QR_MOCK_ISSUE} />
        </div>
      </div>

      <div className="space-y-12">
        <p className="text-body2b text-black">구분별 장수</p>
        <div className="grid grid-cols-3 gap-12 mobile:grid-cols-1">
          {PAPER_QR_CATEGORIES.map(({ value, label }) => (
            <div key={value} className="space-y-8">
              <p className="text-caption1r text-gray-600">{label}</p>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="0"
                value={counts[value]}
                onChange={(e) =>
                  setCounts((prev) => ({ ...prev, [value]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>
        <p
          className={`break-keep text-caption1r ${isOverLimit ? 'text-error' : 'text-gray-400'}`}
        >
          합계 {total}장 · 한 번에 최대 {MAX_TOKENS_PER_ISSUE}장,{' '}
          {MAX_TOKENS_PER_REQUEST}장이 넘으면 나눠서 발급합니다.
        </p>
      </div>

      <div className="mt-auto space-y-12">
        <Button
          onClick={handleIssue}
          disabled={isIssuing || total === 0 || isOverLimit}
        >
          {isIssuing ? '발급 중...' : `${total}장 발급`}
        </Button>
        {partialNotice && (
          <p className="break-keep text-body2r text-error">{partialNotice}</p>
        )}
      </div>
    </section>
  );
};

export default PaperQrIssueCard;
