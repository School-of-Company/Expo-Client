'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
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

const ProgramForm = ({ params }: { params: { expo_id: string } }) => {
  const [expoData, setExpoData] = useState<Program[]>([]);
  const [navigation, setnavigation] = useState<string>('standard');
  const router = useRouter();

  const requestPrintCategories = useMemo(() => {
    if (navigation === 'training') {
      return ['번호', '프로그램', '시작시간', '종료시간', '상태'];
    }
    return ['번호', '프로그램', '시작시간', '종료시간'];
  }, [navigation]);

  useEffect(() => {
    const fetchExpoData = async () => {
      try {
        const endpoint =
          navigation === 'training'
            ? `/api/training/program/${params.expo_id}`
            : `/api/standard/program/${params.expo_id}`;

        const response = await axios.get(endpoint);
        setExpoData(response.data);
      } catch (error) {
        console.error('Error fetching expo data:', error);
      }
    };
    fetchExpoData();
  }, [params.expo_id, navigation]);

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-[46px] px-5">
      <ProgramNavigation state={navigation} setState={setnavigation} />
      <TableForm
        categories={requestPrintCategories}
        data={expoData}
        maxHeight="414px"
        footerType="route"
        text="프로그램 수"
        actions={routeActions(router)}
      />
    </div>
  );
};

export default ProgramForm;
