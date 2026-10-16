import { Metadata } from 'next';
import { ExhibitionLotteryPage } from '@/views/exhibition/lottery';

export const metadata: Metadata = {
  title: '경품 추첨 설정',
  description:
    '박람회 만족도 조사의 경품 추첨을 켜고 끄고 당첨 번호를 관리하는 관리자 전용 페이지입니다.',
};

const page = ({ params }: { params: { expo_id: string } }) => {
  return <ExhibitionLotteryPage id={params.expo_id} />;
};

export default page;
