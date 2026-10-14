'use client';

import { QRCodeSVG } from 'qrcode.react';
import { getCategoryLabel, PaperQrCategory } from '../../model/constants';

export interface PaperQrTicketCardProps {
  category: PaperQrCategory;
  qrValue: string;
  expoTitle: string;
  // 사람이 읽는 코드. 실제 발급 토큰에는 아직 없다
  code?: string;
  // 실제 토큰이면 끝 6자리
  tokenTail?: string;
  // 예시 데이터면 워터마크를 깐다
  isSample?: boolean;
  statusLabel?: string;
}

const PaperQrTicketCard = ({
  category,
  qrValue,
  expoTitle,
  code,
  tokenTail,
  isSample = false,
  statusLabel,
}: PaperQrTicketCardProps) => (
  <div className="relative flex flex-col items-center gap-8 overflow-hidden rounded-sm border-1 border-dashed border-gray-300 bg-white px-16 py-20">
    <p className="text-body2b text-black">
      {getCategoryLabel(category)} 입장권
    </p>
    <div className={isSample ? 'opacity-40' : undefined}>
      <QRCodeSVG value={qrValue} size={120} />
    </div>
    {code ? (
      <p className="text-caption1b text-gray-700">{code}</p>
    ) : (
      <p className="text-caption2r text-gray-400">
        코드 발급 전{tokenTail ? ` · 토큰 ${tokenTail}` : ''}
      </p>
    )}
    {statusLabel && (
      <p className="text-caption2r text-gray-500">{statusLabel}</p>
    )}
    <p className="break-keep text-center text-caption2r text-gray-500">
      {expoTitle}
    </p>
    {isSample && (
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="-rotate-[20deg] rounded-sm border-2 border-solid border-error bg-white px-12 py-4 text-h3b text-error">
          예시
        </span>
      </span>
    )}
  </div>
);

export default PaperQrTicketCard;
