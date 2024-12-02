'use client';

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ProgramNavigation } from '@/entities/program';
import { fileActions } from '@/shared/model/footerActions';
import { TableForm } from '@/shared/ui/Table';

interface Program {
  id: number;
  title: string;
  startedAt: string;
  endedAt: string;
  category: string;
}

const ProgramForm = ({ params }: { params: { expo_id: string } }) => {
  const requestPrintCategories = [
    '번호',
    '프로그램',
    '시작시간',
    '종료시간',
    '상태',
  ];
  const [expoData, setExpoData] = useState<Program[]>([]);
  const [navigation, setnavigation] = useState<string>('standard');

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
        footerType="default"
        text="프로그램 수"
        actions={fileActions(params)}
      />
    </div>
  );
};

export default ProgramForm;
