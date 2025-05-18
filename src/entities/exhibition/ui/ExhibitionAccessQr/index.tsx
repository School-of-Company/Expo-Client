import { QRCodeSVG } from 'qrcode.react';

const ExhibitionAccessQr = ({
  id,
  userType,
}: {
  id: string;
  userType: string;
}) => {
  return (
    <QRCodeSVG
      className="h-[420px] w-[420px] tablet:h-[280px] tablet:w-[280px]"
      value={`${process.env.NEXT_PUBLIC_CLIENT_BASE_URL}/application/${id}?formType=application&userType=${userType}&applicationType=onsite`}
    />
  );
};

export default ExhibitionAccessQr;
