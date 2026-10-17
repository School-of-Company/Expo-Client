import { redirect } from 'next/navigation';
import { EXPO_QR_TABS, getExpoRoutes } from '@/shared/config';

// 현장 등록 QR 은 QR 화면의 탭으로 옮겼다. 예전 주소로 들어오면 같은 대상을 고른 탭으로 보낸다
const page = ({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { userType?: string; applicationType?: string };
}) => {
  const routes = getExpoRoutes(params.id);
  redirect(
    searchParams.userType
      ? routes.accessQr(
          searchParams.userType,
          searchParams.applicationType || 'PRE',
        )
      : `${routes.qr}?tab=${EXPO_QR_TABS.access}`,
  );
};

export default page;
