'use client';

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { getErrorStatus } from './http/apiError';

// 4xx 는 다시 보내도 결과가 같다. 네트워크 오류·5xx·상태를 모르는 오류만 한 번 더 시도한다
const MAX_RETRY = 1;
const shouldRetry = (failureCount: number, error: unknown) => {
  const status = getErrorStatus(error);
  if (status !== undefined && status >= 400 && status < 500) return false;
  return failureCount < MAX_RETRY;
};

const TanstackProviders = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 60 * 5000,
            retry: shouldRetry,
          },
        },
        queryCache: new QueryCache({
          onError: (error, query) => {
            // 실패가 정상 흐름인 조회는 meta.silent 로 토스트를 끈다
            if (query.meta?.silent) return;
            toast.error(`${(error as Error).message}`);
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default TanstackProviders;
