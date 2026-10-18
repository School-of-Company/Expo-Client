import { redirect } from 'next/navigation';

// 요청 시점에 환경변수를 읽어야 박람회가 바뀌어도 재배포 없이 따라간다
export const dynamic = 'force-dynamic';

// 알림톡 템플릿에 넣는 고정 신청 링크(/apply) → 현재 박람회 신청 페이지
const page = () => {
  const expoId = process.env.MAIN_EXPO_ID;
  redirect(expoId ? `/application/forms/${expoId}` : '/');
};

export default page;
