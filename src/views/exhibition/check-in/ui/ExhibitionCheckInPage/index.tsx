import { QRScannerTable } from '@/features/exhibition/check-in';
import { PageShell } from '@/widgets/layout';

const ExhibitionCheckInPage = ({ id }: { id: string }) => {
  return (
    <PageShell>
      <QRScannerTable id={id} />
    </PageShell>
  );
};

export default ExhibitionCheckInPage;
