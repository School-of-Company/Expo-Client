'use client';

import axios from 'axios';
import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    const fetchExpoData = async () => {
      try {
        const response = await axios.get(
          `/api/training/program/${params.expo_id}`,
        );
        setExpoData(response.data);
      } catch (error) {
        console.error('Error fetching expo data:', error);
      }
    };
    fetchExpoData();
  }, [params.expo_id]);

  return (
    <div>
      <TableForm
        categories={requestPrintCategories}
        data={expoData}
        maxHeight="414px"
        footerType="default"
        text="프로그램 수"
        actions={fileActions}
      />
    </div>
  );
};

export default ProgramForm;
