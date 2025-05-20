import { Metadata } from 'next';
import { SMSPage } from '@/views/SMS';

export const metadata: Metadata = {
  title: '문자 발송',
  description:
    '박람회 참가자에게 안내 문자(SMS)를 전송할 수 있는 관리자 전용 페이지입니다.',
};

const page = () => {
  return <SMSPage />;
};

export default page;
