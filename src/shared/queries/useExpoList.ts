import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { getExpoPage } from '../api/getExpoList';

// URL의 ?page(1부터 시작)를 읽어 서버 페이지(0부터 시작)를 조회합니다.
export const useExpoPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const { data, isLoading } = useQuery({
    queryKey: ['expoList', 'page', page],
    queryFn: () => getExpoPage(page - 1),
  });

  const totalPages = data?.totalPages ?? 0;

  // 삭제 등으로 현재 페이지가 사라지면 마지막 페이지로 이동합니다.
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(totalPages));
      router.replace(`?${params.toString()}`);
    }
  }, [page, totalPages, router, searchParams]);

  return { data, isLoading, page };
};
