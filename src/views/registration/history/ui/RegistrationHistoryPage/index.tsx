import { HistoryLedger } from '@/features/registration/history';
import { Header } from '@/widgets/layout';

const RegistrationHistoryPage = () => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <HistoryLedger />
      </div>
    </div>
  );
};

export default RegistrationHistoryPage;
