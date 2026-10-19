import { redirect } from 'next/navigation';
import { getRegistrationRoutes } from '@/shared/config';

// 프로그램용 폼 목록은 신청관리의 폼 탭으로 옮겼다. 예전 주소·북마크는 그쪽으로 보낸다
const Page = ({ params }: { params: { expoId: string } }) => {
  redirect(getRegistrationRoutes(params.expoId).forms);
};

export default Page;
