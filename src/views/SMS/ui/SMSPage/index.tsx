import { WriteSMSForm } from '@/features/sms/send-message';
import { Header } from '@/widgets/layout';

const SMSPage = () => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <WriteSMSForm />
      </div>
    </div>
  );
};

export default SMSPage;
