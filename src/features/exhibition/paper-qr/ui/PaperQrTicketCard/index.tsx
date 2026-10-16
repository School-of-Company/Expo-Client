'use client';

import { QRCodeSVG } from 'qrcode.react';
import { PaperQrItem } from '../../api/qrTokensApi';
import { getCategoryLabel, getCategoryPrintColor } from '../../model/constants';

interface PaperQrTicketCardProps {
  item: PaperQrItem;
  expoTitle: string;
}

/** A4 인쇄물과 같은 모양의 미리보기. 띠 색으로 구분을 보여 준다 */
const PaperQrTicketCard = ({ item, expoTitle }: PaperQrTicketCardProps) => (
  <div className="relative flex flex-col overflow-hidden rounded-sm border-1 border-solid border-gray-200 bg-white">
    <div
      className="flex items-baseline justify-between gap-8 px-12 py-8 text-white"
      style={{ background: getCategoryPrintColor(item.category) }}
    >
      <p className="text-body2b">{getCategoryLabel(item.category)}</p>
      <p className="text-caption2b">입장권</p>
    </div>
    <div className="flex flex-col items-center gap-8 px-16 py-12">
      <p className="break-keep text-center text-caption1b text-black">
        {expoTitle}
      </p>
      <div className={item.revoked ? 'opacity-40' : undefined}>
        <QRCodeSVG value={item.token} size={112} />
      </div>
      <p className="font-mono text-caption1b tracking-wide text-gray-800">
        {item.code}
      </p>
      {item.revoked ? (
        <p className="text-caption2r text-error">사용 중지됨 · 인쇄 제외</p>
      ) : (
        <p className="text-caption2r text-gray-500">
          박람회 입장 전용 · 하루 1회
        </p>
      )}
    </div>
  </div>
);

export default PaperQrTicketCard;
