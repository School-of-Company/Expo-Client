'use client';

import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react';
import { ProgramNavigation } from '@/entities/program';
import { routeActions } from '@/shared/model/footerActions';
import { TableForm } from '@/shared/ui/Table';

interface Program {
  id: number;
  title: string;
  startedAt: string;
  endedAt: string;
  category: string;
}

const ProgramForm = ({ id }: { id: string }) => {
  const searchParams = useSearchParams();
  const navigation = searchParams.get('navigation') || 'standard';
  const [expoData, setExpoData] = useState<Program[]>([]);
  const router = useRouter();

  const requestPrintCategories = useMemo(() => {
    return navigation === 'training'
      ? ['번호', '프로그램', '시작시간', '종료시간', '상태']
      : ['번호', '프로그램', '시작시간', '종료시간'];
  }, [navigation]);

  useEffect(() => {
    const fetchExpoData = async () => {
      try {
        const endpoint =
          navigation === 'training'
            ? `/api/training/program/${id}`
            : `/api/standard/program/${id}`;

        const response = await axios.get(endpoint);
        setExpoData(response.data);
      } catch (error) {
        console.error('Error fetching expo data:', error);
      }
    };

    fetchExpoData();
  }, [id, navigation]);

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-[46px] px-5">
      <ProgramNavigation />
      <TableForm
        categories={requestPrintCategories}
        data={expoData}
        maxHeight="414px"
        footerType="route"
        text="프로그램 수"
        actions={routeActions(router, navigation)}
      />
    </div>
  );
};

export default ProgramForm;
