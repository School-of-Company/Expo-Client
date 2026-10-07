'use client';

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-toastify';

const TanstackProviders = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 60 * 5000,
            retry: 1,
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
