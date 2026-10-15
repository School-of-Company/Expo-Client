'use client';

import { QRCodeSVG } from 'qrcode.react';
import { PaperQrItem } from '../../api/qrTokensApi';
import { getCategoryLabel } from '../../model/constants';

interface PaperQrTicketCardProps {
  item: PaperQrItem;
  expoTitle: string;
}

const PaperQrTicketCard = ({ item, expoTitle }: PaperQrTicketCardProps) => (
  <div className="relative flex flex-col items-center gap-8 overflow-hidden rounded-sm border-1 border-dashed border-gray-300 bg-white px-16 py-20">
    <p className="text-body2b text-black">
      {getCategoryLabel(item.category)} 입장권
    </p>
    <div className={item.revoked ? 'opacity-40' : undefined}>
      <QRCodeSVG value={item.token} size={120} />
    </div>
    <p className="text-caption1b text-gray-700">{item.code}</p>
    {item.revoked && (
      <p className="text-caption2r text-error">사용 중지됨 · 인쇄 제외</p>
    )}
    <p className="break-keep text-center text-caption2r text-gray-500">
      {expoTitle}
    </p>
  </div>
);

export default PaperQrTicketCard;
