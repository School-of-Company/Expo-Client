'use client';

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { fileActions } from '@/shared/model/footerActions';
import SelectUserType from '@/shared/ui/SelectUserType';
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
  const selectOptionCategories = [
    { value: 'trainee', label: '사전 교원연수참가자' },
    { value: 'FIELD', label: '현장신청자' },
    { value: 'PRE', label: '사전 행사참가자' },
  ];
  const [expoData, setExpoData] = useState<Program[]>([]);
  const [selectOption, setSelectOption] = useState<string>('trainee');

  useEffect(() => {
    const fetchExpoData = async () => {
      try {
        let endpoint = '';
        let paramsObj: { type?: string } = {};
        if (selectOption === 'trainee') {
          endpoint = `/api/trainee/${params.expo_id}`;
        } else {
          endpoint = `/api/participant/${params.expo_id}?${selectOption}`;
          paramsObj = { type: selectOption };
        }

        const response = await axios.get(endpoint, { params: paramsObj });
        setExpoData(response.data);
      } catch (error) {
        console.error('Error fetching expo data:', error);
      }
    };

    fetchExpoData();
  }, [params.expo_id, selectOption]);

  useEffect(() => {
    console.log(selectOption);
  }, [selectOption]);

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-[30px] px-5">
      <SelectUserType
        options={selectOptionCategories}
        defaultValue="trainee"
        onChange={(value) => setSelectOption(value)}
      />
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
