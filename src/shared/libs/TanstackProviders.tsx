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
            retryDelay: 1500,
            retry: 5,
          },
        },
        queryCache: new QueryCache({
          onError: (error) => {
            toast.error(`Query failed: ${(error as Error).message}`);
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default TanstackProviders;
