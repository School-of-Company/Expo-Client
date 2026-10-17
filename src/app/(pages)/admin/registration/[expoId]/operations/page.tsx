import { redirect } from 'next/navigation';

// 박람회 운영 페이지는 박람회 상세의 메뉴 패널로 옮겼다. 예전 주소로 들어오면 상세로 보낸다
const page = ({ params }: { params: { expoId: string } }) => {
  redirect(`/exhibition/detail/${encodeURIComponent(params.expoId)}`);
};

export default page;
