'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Input, MockDataBadge } from '@/shared/ui';
import { PAPER_QR_MOCK_ISSUE, PaperQrCode } from '../../mock/paperQrMock';
import { DEFAULT_LABEL_SIZE } from '../../model/constants';
import { PaperQrBatch } from '../../model/issuePaperQrTokens';
import { getTokenTail, printPaperQrA4 } from '../../model/printPaperQrA4';
import { printPaperQrLabels } from '../../model/printPaperQrLabels';
import PaperQrTicketCard from '../PaperQrTicketCard';

export type PaperQrOutput =
  | { kind: 'issued'; batches: PaperQrBatch[] }
  | { kind: 'sample'; codes: PaperQrCode[] };

interface PaperQrOutputListProps {
  output: PaperQrOutput | null;
  expoTitle: string;
  // 예시 다시 인쇄 조회에서만 쓴다
  onNextLookup?: () => void;
}

// 수천 장을 한 화면에 그리면 느려서 미리보기는 앞부분만 보인다
const PREVIEW_LIMIT = 120;

const STATUS_LABEL: Record<PaperQrCode['status'], string | undefined> = {
  ACTIVE: undefined,
  USED: '입장 완료',
  REVOKED: '사용 중지됨',
};

const actionButton =
  'rounded-sm px-16 py-8 text-caption1b whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-40';

const PaperQrOutputList = ({
  output,
  expoTitle,
  onNextLookup,
}: PaperQrOutputListProps) => {
  const [labelSize, setLabelSize] = useState(DEFAULT_LABEL_SIZE);
  const [isPrinting, setIsPrinting] = useState(false);

  const isSample = output?.kind === 'sample';
  const batches = output?.kind === 'issued' ? output.batches : [];
  const total = isSample
    ? output.codes.length
    : batches.reduce((sum, { tokens }) => sum + tokens.length, 0);
  const isLabelSizeValid = labelSize.width >= 20 && labelSize.height >= 15;
  const canPrint = !isSample && total > 0 && !isPrinting;

  const print = async (mode: 'a4' | 'label') => {
    setIsPrinting(true);
    try {
      if (mode === 'a4') {
        await printPaperQrA4(batches, { expoTitle });
      } else {
        await printPaperQrLabels(batches, { expoTitle, labelSize });
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '인쇄에 실패했습니다.',
      );
    } finally {
      setIsPrinting(false);
    }
  };

  const tickets = isSample
    ? output.codes
        .slice(0, PREVIEW_LIMIT)
        .map((item) => (
          <PaperQrTicketCard
            key={item.code}
            category={item.category}
            qrValue={item.qrValue}
            code={item.code}
            statusLabel={STATUS_LABEL[item.status]}
            expoTitle={expoTitle}
            isSample
          />
        ))
    : batches
        .flatMap(({ category, tokens }) =>
          tokens.map((token) => ({ category, token })),
        )
        .slice(0, PREVIEW_LIMIT)
        .map(({ category, token }) => (
          <PaperQrTicketCard
            key={token}
            category={category}
            qrValue={token}
            tokenTail={getTokenTail(token)}
            expoTitle={expoTitle}
          />
        ));

  return (
    <section className="space-y-16 rounded-sm border-1 border-solid border-gray-200 p-24 mobile:p-16">
      <div className="flex flex-wrap items-start justify-between gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-8">
            <p className="text-h3b text-black">출력 목록 · {total}장</p>
            {isSample && <MockDataBadge issue={PAPER_QR_MOCK_ISSUE} />}
          </div>
          <p className="break-keep text-caption1r text-gray-500">
            A4 기준 3열 배열. 화면에서 QR이 정상 표시되면 인쇄 버튼을
            눌러주세요.
          </p>
        </div>
        <div className="flex flex-wrap gap-8">
          <button
            type="button"
            className={`${actionButton} bg-main-600 text-white`}
            onClick={() => print('a4')}
            disabled={!canPrint}
          >
            A4 인쇄
          </button>
          <button
            type="button"
            className={`${actionButton} border-1 border-solid border-main-600 text-main-600`}
            onClick={() => print('label')}
            disabled={!canPrint || !isLabelSizeValid}
          >
            라벨 인쇄
          </button>
          {isSample && onNextLookup && (
            <button
              type="button"
              className={`${actionButton} bg-gray-100 text-gray-700`}
              onClick={onNextLookup}
            >
              다음 연번 조회
            </button>
          )}
        </div>
      </div>

      {isSample && (
        <p className="break-keep text-caption1r text-error">
          예시 QR은 실제 입장권이 아니라 인쇄할 수 없습니다.
        </p>
      )}

      {!isSample && total > 0 && (
        <div className="flex flex-wrap items-end gap-12">
          <div className="w-[120px] space-y-4">
            <p className="text-caption1r text-gray-600">라벨 가로(mm)</p>
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
          <div className="w-[120px] space-y-4">
            <p className="text-caption1r text-gray-600">라벨 세로(mm)</p>
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
          <p className="flex-1 break-keep text-caption2r text-gray-400">
            라벨 인쇄는 한 장에 QR 하나씩 찍습니다. 인쇄 창에서 여백은
            &apos;없음&apos;, 배율은 100%로 설정해 주세요.
          </p>
        </div>
      )}

      {total === 0 ? (
        <p className="rounded-sm bg-gray-100 px-16 py-24 text-center text-body2r text-gray-500">
          QR을 발급하거나 기존 QR을 조회하면 여기에 표시됩니다.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-12 mobile:!grid-cols-1 tablet:grid-cols-2">
            {tickets}
          </div>
          {total > PREVIEW_LIMIT && (
            <p className="text-caption1r text-gray-400">
              미리보기는 앞 {PREVIEW_LIMIT}장만 보입니다. 인쇄에는 {total}장이
              모두 들어갑니다.
            </p>
          )}
        </>
      )}
    </section>
  );
};

export default PaperQrOutputList;
