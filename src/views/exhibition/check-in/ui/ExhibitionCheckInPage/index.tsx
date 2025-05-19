import { QRScannerTable } from '@/features/exhibition/check-in';
import { Header } from '@/widgets/layout';

const ExhibitionCheckInPage = ({ id }: { id: string }) => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <QRScannerTable id={id} />
      </div>
    </div>
  );
};

export default ExhibitionCheckInPage;
