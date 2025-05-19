'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo } from 'react';
import { ProgramNavigation } from '@/entities/program';
import { withLoading } from '@/shared/hocs';
import { TableForm } from '@/shared/ui/Table';
import { standardCategories, trainingCategories } from '../../model/category';
import { useProgramQueries } from '../../model/useProgramData';

const ProgramListTable = ({ expoId }: { expoId: string }) => {
  const searchParams = useSearchParams();
  const navigation = searchParams.get('navigation') || 'standard';

  const router = useRouter();

  const { programQueries, isLoading } = useProgramQueries(expoId, navigation);

  const requestPrintCategories = useMemo(() => {
    return navigation === 'training' ? trainingCategories : standardCategories;
  }, [navigation]);

  const programData = programQueries.data || [];

  const routeActions = {
    RouteActions: (programId: number) => {
      router.push(
        `/program/${expoId}/detail/${programId}?navigation=${navigation}`,
      );
    },
  };

  return withLoading({
    isLoading,
    children: (
      <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-46 overflow-y-auto">
        <ProgramNavigation />
        <TableForm
          categories={requestPrintCategories}
          data={programData}
          maxHeight="414px"
          footerType="route"
          text="프로그램 수"
          actions={routeActions}
        />
      </div>
    ),
  });
};

export default ProgramListTable;
