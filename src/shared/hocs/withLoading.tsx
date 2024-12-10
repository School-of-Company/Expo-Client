import React from 'react';
import { Loading } from '../ui';

type WithLoadingProps = {
  isLoading: boolean;
  children: React.ReactNode;
};

const withLoading = ({ isLoading, children }: WithLoadingProps) => {
  if (isLoading) return <Loading />;
  return <>{children}</>;
};

export default withLoading;
