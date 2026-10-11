import { LotterySettingsForm } from '@/features/exhibition/lottery';
import { Header } from '@/widgets/layout';

const ExhibitionLotteryPage = ({ id }: { id: string }) => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <LotterySettingsForm expoId={id} />
      </div>
    </div>
  );
};

export default ExhibitionLotteryPage;
