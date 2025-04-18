import React from 'react';
import { Loading } from '../ui';

type WithLoadingProps = {
  isLoading: boolean;
  children: React.ReactNode;
};

const withLoading = ({ isLoading, children }: WithLoadingProps) => {
  if (isLoading)
    return (
      <div className="flex w-full flex-1 items-center justify-center">
        <Loading />
      </div>
    );
  return <>{children}</>;
};

export default withLoading;
