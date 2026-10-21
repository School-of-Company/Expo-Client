import { redirect } from 'next/navigation';
import { getExpoRoutes } from '@/shared/config';

// 박람회 입장은 QR 화면의 탭으로 옮겼다. 예전 주소로 들어오면 그 탭으로 보낸다
const page = ({ params }: { params: { expo_id: string } }) => {
  redirect(getExpoRoutes(params.expo_id).checkIn);
};

export default page;
