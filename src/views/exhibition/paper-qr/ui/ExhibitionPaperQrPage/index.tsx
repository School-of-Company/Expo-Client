import { PaperQrIssueForm } from '@/features/exhibition/paper-qr';
import { Header } from '@/widgets/layout';

const ExhibitionPaperQrPage = ({ id }: { id: string }) => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <PaperQrIssueForm expoId={id} />
      </div>
    </div>
  );
};

export default ExhibitionPaperQrPage;
