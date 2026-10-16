import { LotterySettingsForm } from '@/features/survey-admin';
import { PageShell } from '@/widgets/layout';

const ExhibitionLotteryPage = ({ id }: { id: string }) => {
  return (
    <PageShell>
      <LotterySettingsForm expoId={id} />
    </PageShell>
  );
};

export default ExhibitionLotteryPage;
