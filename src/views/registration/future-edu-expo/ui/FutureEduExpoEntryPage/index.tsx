'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getExpoPage } from '@/shared/api/getExpoPage';
import { FUTURE_EDU_EXPO_ID, getRegistrationRoutes } from '@/shared/config';
import { withLoading } from '@/shared/hocs';
import { ExpoItem } from '@/shared/types/admin/type';
import { QueryError } from '@/shared/ui';
import { Header } from '@/widgets/layout';

// 미래교육박람회 전용 대시보드. 박람회 ID 를 정해 두면(NEXT_PUBLIC_FUTURE_EDU_EXPO_ID) 바로 그 박람회로,
// 없으면 박람회 목록에서 제목에 '미래교육박람회'가 들어간 박람회를 찾아 들어간다.
const CONFIGURED_EXPO_ID = FUTURE_EDU_EXPO_ID;
const TITLE_KEYWORD = '미래교육박람회';
const PAGE_SIZE = 100;
// 박람회가 아주 많아도 목록을 끝없이 읽지 않는다
const MAX_PAGES = 5;

const normalizeTitle = (title: string) => title.replace(/\s+/g, '');

const findFutureEduExpos = async (): Promise<ExpoItem[]> => {
  const expos: ExpoItem[] = [];
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const { content, hasNext } = await getExpoPage(page, PAGE_SIZE);
    expos.push(...content);
    if (!hasNext) break;
  }
  return expos
    .filter(({ title }) => normalizeTitle(title).includes(TITLE_KEYWORD))
    .sort((a, b) => b.startedDay.localeCompare(a.startedDay));
};

const FutureEduExpoEntryPage = () => {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['futureEduExpos'],
    queryFn: findFutureEduExpos,
    enabled: !CONFIGURED_EXPO_ID,
  });

  const targetId =
    CONFIGURED_EXPO_ID ?? (data?.length === 1 ? data[0].id : null);

  useEffect(() => {
    if (targetId) router.replace(getRegistrationRoutes(targetId).dashboard);
  }, [targetId, router]);

  const renderBody = () => {
    if (isError) {
      return (
        <QueryError
          message="박람회 목록을 불러오지 못했습니다."
          onRetry={() => refetch()}
        />
      );
    }
    if (!data || targetId) return null;
    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center gap-12 p-16 text-center">
          <p className="text-body1b text-black">
            미래교육박람회를 찾지 못했습니다.
          </p>
          <p className="break-keep text-body2r text-gray-500">
            제목에 &apos;미래교육박람회&apos;가 들어간 박람회가 없습니다.
          </p>
          <Link href="/" className="text-body2r text-main-600 underline">
            박람회 목록으로
          </Link>
        </div>
      );
    }
    return (
      <div className="w-full max-w-[816px] space-y-16">
        <p className="text-h2b text-black">관리할 미래교육박람회를 고르세요</p>
        <ul className="space-y-8">
          {data.map((expo) => (
            <li key={expo.id}>
              <Link
                href={getRegistrationRoutes(expo.id).dashboard}
                className="flex items-center justify-between gap-16 rounded-sm border-1 border-solid border-gray-200 px-20 py-16"
              >
                <span className="text-body1b text-black">{expo.title}</span>
                <span className="shrink-0 text-body2r text-gray-500">
                  {expo.startedDay} ~ {expo.finishedDay}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        {withLoading({
          isLoading: isLoading || !!targetId,
          children: renderBody(),
        })}
      </div>
    </div>
  );
};

export default FutureEduExpoEntryPage;
