import { ScheduleManager } from '@/features/registration/schedule';
import { Header } from '@/widgets/layout';
import { RegistrationTabs } from '@/widgets/registration';

const RegistrationSchedulePage = () => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <RegistrationTabs />
      <div className="flex flex-1 justify-center p-16">
        <ScheduleManager />
      </div>
    </div>
  );
};

export default RegistrationSchedulePage;
