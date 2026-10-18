import { redirect } from 'next/navigation';
import { getExpoRoutes } from '@/shared/config';

// 등록 완료 화면은 박람회 랜딩으로 옮겼다. 예전 주소로 들어오면 결과 안내(쿼리)를 그대로 넘긴다
const page = ({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
}) => {
  const query = new URLSearchParams(
    Object.entries(searchParams).flatMap(([key, value]) =>
      typeof value === 'string' ? [[key, value]] : [],
    ),
  ).toString();
  const landing = getExpoRoutes(params.id).landing;
  redirect(query ? `${landing}?${query}` : landing);
};

export default page;
