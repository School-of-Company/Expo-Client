'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input } from '@/shared/ui';
import { PaperQrItem } from '../../api/qrTokensApi';
import { DEFAULT_LABEL_SIZE } from '../../model/constants';
import { printPaperQrA4 } from '../../model/printPaperQrA4';
import { printPaperQrLabels } from '../../model/printPaperQrLabels';
import PaperQrTicketCard from '../PaperQrTicketCard';

export interface PaperQrOutput {
  /** 방금 발급한 QR 인지, 다시 인쇄하려고 조회한 QR 인지 */
  kind: 'issued' | 'lookup';
  items: PaperQrItem[];
  /** 다시 인쇄 조회의 구분·연번 범위 */
  range?: string;
  /** 표시 중인 목록이 이전 조회 결과일 때의 안내 */
  notice?: string;
}

interface PaperQrOutputListProps {
  output: PaperQrOutput | null;
  expoTitle: string;
  // 다시 인쇄 조회 결과에서만 쓴다
  onNextLookup?: () => void;
  /** 새 범위를 조회하는 동안은 이전 결과를 인쇄하지 않는다 */
  isLookingUp?: boolean;
}

// 수천 장을 한 화면에 그리면 느려서 미리보기는 앞부분만 보인다
const PREVIEW_LIMIT = 120;

const PaperQrOutputList = ({
  output,
  expoTitle,
  onNextLookup,
  isLookingUp = false,
}: PaperQrOutputListProps) => {
  const [labelSize, setLabelSize] = useState(DEFAULT_LABEL_SIZE);
  const [isPrinting, setIsPrinting] = useState(false);

  const items = output?.items ?? [];
  const total = items.length;
  // 사용 중지한 QR 은 찍어도 입장할 수 없어 인쇄에서 뺀다
  const printable = items.filter(({ revoked }) => !revoked);
  const isLabelSizeValid = labelSize.width >= 20 && labelSize.height >= 15;
  const canPrint = printable.length > 0 && !isPrinting && !isLookingUp;

  const print = async (mode: 'a4' | 'label') => {
    setIsPrinting(true);
    try {
      if (mode === 'a4') {
        await printPaperQrA4(printable, { expoTitle });
      } else {
        await printPaperQrLabels(printable, { expoTitle, labelSize });
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '인쇄에 실패했습니다.',
      );
    } finally {
      setIsPrinting(false);
    }
  };

  const tickets = items
    .slice(0, PREVIEW_LIMIT)
    .map((item) => (
      <PaperQrTicketCard key={item.code} item={item} expoTitle={expoTitle} />
    ));

  return (
    <section className="space-y-16 rounded-sm border-1 border-solid border-gray-200 p-24 mobile:p-16">
      <div className="flex flex-wrap items-start justify-between gap-12">
        <div className="space-y-4">
          <p className="text-h3b text-black">
            출력 목록 · {total}장
            {printable.length < total &&
              ` (인쇄 ${printable.length}장, 사용 중지 ${total - printable.length}장 제외)`}
          </p>
          {output?.range && (
            <p className="text-body2r text-gray-700">
              조회 범위: {output.range}
            </p>
          )}
          {output?.notice && (
            <p className="break-keep text-caption1b text-error">
              {output.notice}
            </p>
          )}
          <p className="break-keep text-caption1r text-gray-500">
            A4 기준 3열 배열. 화면에서 QR이 정상 표시되면 인쇄 버튼을
            눌러주세요.
          </p>
        </div>
        <div className="flex flex-wrap gap-8">
          <Button size="small" onClick={() => print('a4')} disabled={!canPrint}>
            A4 인쇄
          </Button>
          <Button
            size="small"
            variant="white"
            onClick={() => print('label')}
            disabled={!canPrint || !isLabelSizeValid}
          >
            라벨 인쇄
          </Button>
          {output?.kind === 'lookup' && onNextLookup && (
            <Button
              size="small"
              variant="gray"
              onClick={onNextLookup}
              disabled={isLookingUp}
            >
              다음 연번 조회
            </Button>
          )}
        </div>
      </div>

      {printable.length > 0 && (
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
          {output?.kind === 'lookup'
            ? '이 범위에 조회된 QR이 없습니다. 다른 연번을 조회해 주세요.'
            : 'QR을 발급하거나 기존 QR을 조회하면 여기에 표시됩니다.'}
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
