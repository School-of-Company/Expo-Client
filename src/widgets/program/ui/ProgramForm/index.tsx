'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo } from 'react';
import { ProgramNavigation } from '@/entities/program';
import withLoading from '@/shared/hocs/withLoading';
import { routeActions } from '@/shared/model/footerActions';
import { TableForm } from '@/shared/ui/Table';
import { standardCategories, trainingCategories } from '../../model/category';
import { useProgramQueries } from '../../model/useProgramData';

const ProgramForm = ({ id }: { id: string }) => {
  const searchParams = useSearchParams();
  const navigation = searchParams.get('navigation') || 'standard';

  const router = useRouter();

  const { programQueries, isLoading } = useProgramQueries(id, navigation);

  const requestPrintCategories = useMemo(() => {
    return navigation === 'training' ? trainingCategories : standardCategories;
  }, [navigation]);

  const programData = programQueries.data || [];

  return withLoading({
    isLoading,
    children: (
      <div className="mx-auto w-full max-w-[1200px] space-y-[46px] px-5">
        <ProgramNavigation />
        <TableForm
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
