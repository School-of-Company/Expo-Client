import { QRCodeSVG } from 'qrcode.react';

/** 참가자 화면으로 가는 QR. `path` 는 신청 사이트 안의 경로다 */
const ExhibitionAccessQr = ({ path }: { path: string }) => {
  return (
    <QRCodeSVG
      className="h-[420px] w-[420px] tablet:h-[280px] tablet:w-[280px]"
      value={`${process.env.NEXT_PUBLIC_CLIENT_BASE_URL}${path}`}
    />
  );
};

export default ExhibitionAccessQr;
