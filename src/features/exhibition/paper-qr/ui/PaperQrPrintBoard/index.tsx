'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useExpoDetail } from '@/shared/queries';
import { getPaperQrMockData, PaperQrCode } from '../../mock/paperQrMock';
import { PaperQrBatch } from '../../model/issuePaperQrTokens';
import PaperQrIssueCard from '../PaperQrIssueCard';
import PaperQrOutputList from '../PaperQrOutputList';
import PaperQrReprintCard, {
  MAX_REPRINT_LOOKUP,
  PaperQrReprintDraft,
} from '../PaperQrReprintCard';

type OutputSource = 'issued' | 'sample';

const toPositive = (value: string, fallback: number) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
};

const PaperQrPrintBoard = ({ expoId }: { expoId: string }) => {
  const { data: expoDetail } = useExpoDetail(expoId);
  // 재조회 API가 없어 인쇄를 다시 할 수 있도록 이 화면에서만 메모리에 둔다
  const [issuedBatches, setIssuedBatches] = useState<PaperQrBatch[]>([]);
  const [sampleCodes, setSampleCodes] = useState<PaperQrCode[] | null>(null);
  const [source, setSource] = useState<OutputSource>('issued');
  const [draft, setDraft] = useState<PaperQrReprintDraft>({
    category: 'ADULT',
    start: '1',
    count: '30',
  });

  const lookup = (next: PaperQrReprintDraft) => {
    const start = toPositive(next.start, 1);
    const count = Math.min(toPositive(next.count, 30), MAX_REPRINT_LOOKUP);
    const codes = getPaperQrMockData()
      .codes.filter(
        ({ category, serial }) => category === next.category && serial >= start,
      )
      .slice(0, count);
    if (codes.length === 0) {
      toast.info('조회된 QR이 없습니다.');
      return;
    }
    setDraft({ ...next, start: String(start), count: String(count) });
    setSampleCodes(codes);
    setSource('sample');
  };

  const handleNextLookup = () => {
    const start = toPositive(draft.start, 1);
    const count = toPositive(draft.count, 30);
    lookup({ ...draft, start: String(start + count) });
  };

  const handleIssued = (batches: PaperQrBatch[]) => {
    setIssuedBatches(batches);
    setSource('issued');
  };

  const hasIssued = issuedBatches.length > 0;
  const output =
    source === 'sample' && sampleCodes
      ? { kind: 'sample' as const, codes: sampleCodes }
      : hasIssued
        ? { kind: 'issued' as const, batches: issuedBatches }
        : null;

  const tabClass = (active: boolean) =>
    `rounded-full px-16 py-6 text-caption1b ${
      active ? 'bg-main-600 text-white' : 'bg-gray-100 text-gray-600'
    }`;

  return (
    <div className="flex flex-col gap-24">
      <div className="grid grid-cols-2 gap-24 tablet:grid-cols-1">
        <PaperQrIssueCard
          expoId={expoId}
          hasIssued={hasIssued}
          onIssued={handleIssued}
        />
        <PaperQrReprintCard
          draft={draft}
          onDraftChange={setDraft}
          onLookup={() => lookup(draft)}
        />
      </div>

      {hasIssued && sampleCodes && (
        <div className="flex gap-8" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={source === 'issued'}
            className={tabClass(source === 'issued')}
            onClick={() => setSource('issued')}
          >
            방금 발급한 QR
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={source === 'sample'}
            className={tabClass(source === 'sample')}
            onClick={() => setSource('sample')}
          >
            다시 인쇄 조회 결과
          </button>
        </div>
      )}

      <PaperQrOutputList
        output={output}
        expoTitle={expoDetail?.title ?? ''}
        onNextLookup={handleNextLookup}
      />
    </div>
  );
};

export default PaperQrPrintBoard;
