import { AttendanceMonitor } from '@/features/registration/attendance';
import { Header } from '@/widgets/layout';
import { RegistrationTabs } from '@/widgets/registration';

const RegistrationAttendancePage = () => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <RegistrationTabs />
      <div className="flex flex-1 justify-center p-16">
        <AttendanceMonitor />
      </div>
    </div>
  );
};

export default RegistrationAttendancePage;
