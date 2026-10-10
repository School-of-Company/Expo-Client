'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useExpoDetail } from '@/shared/queries';
import { Button, Input } from '@/shared/ui';
import {
  DEFAULT_LABEL_SIZE,
  MAX_TOKENS_PER_REQUEST,
  PAPER_QR_CATEGORIES,
  PaperQrCategory,
} from '../../model/constants';
import {
  issuePaperQrTokens,
  PaperQrBatch,
} from '../../model/issuePaperQrTokens';
import { printPaperQrLabels } from '../../model/printPaperQrLabels';

const toCount = (value: string) => {
  const count = Number(value);
  return Number.isInteger(count) && count > 0 ? count : 0;
};

const PaperQrIssueForm = ({ expoId }: { expoId: string }) => {
  const { data: expoDetail } = useExpoDetail(expoId);
  const [counts, setCounts] = useState<Record<PaperQrCategory, string>>({
    ADULT: '',
    CHILD: '',
    GENERAL: '',
  });
  const [labelSize, setLabelSize] = useState(DEFAULT_LABEL_SIZE);
  const [isIssuing, setIsIssuing] = useState(false);
  // 재조회 API가 없어 인쇄를 다시 할 수 있도록 이 화면에서만 메모리에 둔다
  const [lastBatches, setLastBatches] = useState<PaperQrBatch[]>([]);

  const requested = PAPER_QR_CATEGORIES.map(({ value }) => ({
    category: value,
    count: toCount(counts[value]),
  }));
  const total = requested.reduce((sum, { count }) => sum + count, 0);
  const isLabelSizeValid = labelSize.width >= 20 && labelSize.height >= 15;

  const print = async (batches: PaperQrBatch[]) => {
    try {
      await printPaperQrLabels(batches, {
        expoTitle: expoDetail?.title ?? '',
        labelSize,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '인쇄에 실패했습니다.',
      );
    }
  };

  const handleIssue = async () => {
    if (total === 0) {
      toast.warn('발급할 장수를 입력해 주세요.');
      return;
    }
    setIsIssuing(true);
    try {
      const batches = await issuePaperQrTokens(expoId, requested);
      setLastBatches(batches);
      toast.success(`종이 QR ${total}장을 발급했습니다.`);
      await print(batches);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '종이 QR 발급에 실패했습니다.',
      );
    } finally {
      setIsIssuing(false);
    }
  };

  const lastSummary = lastBatches
    .map(
      ({ category, tokens }) =>
        `${PAPER_QR_CATEGORIES.find((item) => item.value === category)?.label} ${tokens.length}장`,
    )
    .join(', ');

  return (
    <div className="flex w-full max-w-[816px] flex-col gap-36">
      <div className="space-y-8">
        <p className="text-h2b text-black">종이 QR 발급</p>
        <p className="break-keep text-body2r text-gray-500">
          휴대폰이 없거나 현장 등록이 밀릴 때 나눠 주는 입장용 QR입니다. 한 장은
          하루에 한 번 입장할 수 있습니다. 발급한 QR은 다시 볼 수 없으니 발급 후
          바로 인쇄해 주세요.
        </p>
      </div>

      <section className="space-y-16">
        <p className="text-h4b text-black">구분별 장수</p>
        <div className="grid grid-cols-3 gap-16 mobile:grid-cols-1">
          {PAPER_QR_CATEGORIES.map(({ value, label }) => (
            <div key={value} className="space-y-8">
              <p className="text-body2r text-gray-600">{label}</p>
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
        <p className="text-caption1r text-gray-400">
          합계 {total}장 · {MAX_TOKENS_PER_REQUEST}장이 넘으면 나눠서
          발급합니다.
        </p>
      </section>

      <section className="space-y-16">
        <p className="text-h4b text-black">라벨 크기(mm)</p>
        <div className="grid grid-cols-2 gap-16">
          <div className="space-y-8">
            <p className="text-body2r text-gray-600">가로</p>
            <Input
              type="number"
              inputMode="numeric"
              value={labelSize.width}
              onChange={(e) =>
                setLabelSize((prev) => ({
                  ...prev,
                  width: Number(e.target.value),
                }))
              }
            />
          </div>
          <div className="space-y-8">
            <p className="text-body2r text-gray-600">세로</p>
            <Input
              type="number"
              inputMode="numeric"
              value={labelSize.height}
              onChange={(e) =>
                setLabelSize((prev) => ({
                  ...prev,
                  height: Number(e.target.value),
                }))
              }
            />
          </div>
        </div>
        <p className="break-keep text-caption1r text-gray-400">
          라벨 프린터의 용지 크기에 맞춰 주세요. 인쇄 창에서 여백은
          &apos;없음&apos;, 배율은 100%로 설정합니다.
        </p>
      </section>

      <div className="space-y-12">
        <Button
          onClick={handleIssue}
          disabled={isIssuing || total === 0 || !isLabelSizeValid}
        >
          {isIssuing ? '발급 중...' : `${total}장 발급 후 인쇄`}
        </Button>
        {lastBatches.length > 0 && (
          <div className="space-y-8">
            <p className="text-body2r text-gray-500">
              방금 발급: {lastSummary}
            </p>
            <Button
              variant="white"
              onClick={() => print(lastBatches)}
              disabled={isIssuing || !isLabelSizeValid}
            >
              방금 발급한 QR 다시 인쇄
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperQrIssueForm;
