'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo } from 'react';
import { ProgramNavigation } from '@/entities/program';
import { getRegistrationRoutes } from '@/shared/config';
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
        {/* 이 화면은 조회·출석용이다. 회차 추가·폼 연결·정원은 일정·모집 화면에서 정한다 */}
        <div className="flex items-center justify-between gap-16 rounded-sm border-1 border-solid border-gray-200 px-20 py-12 mobile:flex-col mobile:items-stretch">
          <p className="text-body2r text-gray-500">
            프로그램 회차 추가, 묶음, 신청 폼 연결, 정원·모집 기간은 프로그램
            신청 설정에서 바꿉니다.
          </p>
          <Link
            href={getRegistrationRoutes(expoId).schedule}
            className="shrink-0 rounded-sm border-1 border-solid border-main-600 px-16 py-8 text-center text-caption1b text-main-600"
          >
            프로그램 신청 설정
          </Link>
        </div>
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
