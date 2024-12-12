'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react';
import { ProgramNavigation } from '@/entities/program';
import withLoading from '@/shared/hocs/withLoading';
import { routeActions } from '@/shared/model/footerActions';
import { TableForm } from '@/shared/ui/Table';
import { useProgramQueries } from '../../model/useProgramData';

const ProgramForm = ({ id }: { id: string }) => {
  const searchParams = useSearchParams();
  const navigation = searchParams.get('navigation') || 'standard';
  const [resetKey, setResetKey] = useState(0);
  const router = useRouter();

  const { programQueries, isLoading } = useProgramQueries(id, navigation);

  const requestPrintCategories = useMemo(() => {
    return navigation === 'training'
      ? ['번호', '프로그램', '시작시간', '종료시간', '상태']
      : ['번호', '프로그램', '시작시간', '종료시간'];
  }, [navigation]);

  useEffect(() => {
    setResetKey((prevKey) => prevKey + 1);
  }, [navigation]);

  const programData = programQueries.data || [];

  return withLoading({
    isLoading,
    children: (
      <div className="mx-auto w-full max-w-[1200px] space-y-[46px] px-5">
        <ProgramNavigation />
        <TableForm
          key={resetKey}
          categories={requestPrintCategories}
          data={programData}
          maxHeight="414px"
          footerType="route"
          text="프로그램 수"
          actions={routeActions(router, navigation)}
        />
      </div>
    ),
  });
};

export default ProgramForm;
