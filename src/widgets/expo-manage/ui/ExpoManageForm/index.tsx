'use client';

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FilterTab } from '@/entities/expo-manage';
import { fileActions } from '@/shared/model/footerActions';
import { TableForm } from '@/shared/ui/Table';

interface Program {
  id: number;
  title: string;
  startedAt: string;
  endedAt: string;
  category: string;
}

const ExpoManageForm = ({ params }: { params: { expo_id: string } }) => {
  const requestPrintCategories = [
    '번호',
    '프로그램',
    '시작시간',
    '종료시간',
    '상태',
  ];
  const [expoData, setExpoData] = useState<Program[]>([]);
  const [navigation, _setnavigation] = useState<string>('standard');

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
    <div className="mx-auto w-full max-w-[1200px] space-y-[30px] px-5">
      <FilterTab />
      <TableForm
        categories={requestPrintCategories}
        data={expoData}
        maxHeight="414px"
        footerType="file"
        text="참가자 전체 인원"
        actions={fileActions}
      />
    </div>
  );
};

export default ExpoManageForm;
