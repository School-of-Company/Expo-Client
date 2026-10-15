'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useExpoDetail } from '@/shared/queries';
import { getQrTokens, PaperQrItem } from '../../api/qrTokensApi';
import PaperQrIssueCard from '../PaperQrIssueCard';
import PaperQrOutputList from '../PaperQrOutputList';
import PaperQrReprintCard, {
  MAX_REPRINT_LOOKUP,
  PaperQrReprintDraft,
} from '../PaperQrReprintCard';

type OutputSource = 'issued' | 'lookup';

const toPositive = (value: string, fallback: number) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
};

const PaperQrPrintBoard = ({ expoId }: { expoId: string }) => {
  const { data: expoDetail } = useExpoDetail(expoId);
  const [issuedItems, setIssuedItems] = useState<PaperQrItem[]>([]);
  const [lookupItems, setLookupItems] = useState<PaperQrItem[] | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [source, setSource] = useState<OutputSource>('issued');
  const [draft, setDraft] = useState<PaperQrReprintDraft>({
    category: 'ADULT',
    start: '1',
    count: '30',
  });

  const lookup = async (next: PaperQrReprintDraft) => {
    const start = toPositive(next.start, 1);
    const count = Math.min(toPositive(next.count, 30), MAX_REPRINT_LOOKUP);
    setIsLookingUp(true);
    try {
      const items = await getQrTokens(expoId, {
        category: next.category,
        fromSerial: start,
        count,
      });
      if (items.length === 0) {
        toast.info('조회된 QR이 없습니다.');
        return;
      }
      setDraft({ ...next, start: String(start), count: String(count) });
      setLookupItems(items);
      setSource('lookup');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'QR을 조회하지 못했습니다.',
      );
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleNextLookup = () => {
    const start = toPositive(draft.start, 1);
    const count = toPositive(draft.count, 30);
    lookup({ ...draft, start: String(start + count) });
  };

  const handleIssued = (items: PaperQrItem[]) => {
    setIssuedItems(items);
    setSource('issued');
  };

  // 무효화한 코드가 출력 목록에 있으면 바로 인쇄 제외로 바꾼다
  const handleRevoked = (code: string) => {
    const markRevoked = (items: PaperQrItem[]) =>
      items.map((item) =>
        item.code === code ? { ...item, revoked: true } : item,
      );
    setIssuedItems(markRevoked);
    setLookupItems((prev) => prev && markRevoked(prev));
  };

  const hasIssued = issuedItems.length > 0;
  const output =
    source === 'lookup' && lookupItems
      ? { kind: 'lookup' as const, items: lookupItems }
      : hasIssued
        ? { kind: 'issued' as const, items: issuedItems }
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
          expoId={expoId}
          draft={draft}
          isLookingUp={isLookingUp}
          onDraftChange={setDraft}
          onLookup={() => lookup(draft)}
          onRevoked={handleRevoked}
        />
      </div>

      {hasIssued && lookupItems && (
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
            aria-selected={source === 'lookup'}
            className={tabClass(source === 'lookup')}
            onClick={() => setSource('lookup')}
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
