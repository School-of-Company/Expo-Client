import { redirect } from 'next/navigation';
import { getRegistrationRoutes } from '@/shared/config';

/** 모니터링 화면으로 합쳐졌다. 북마크가 깨지지 않게 보낸다 */
const Page = ({ params }: { params: { expoId: string } }) => {
  redirect(getRegistrationRoutes(params.expoId).dashboard);
};

export default Page;
