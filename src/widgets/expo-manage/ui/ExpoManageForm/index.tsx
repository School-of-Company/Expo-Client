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

const ExpoManageForm = ({ id }: { id: string }) => {
  const baseRequestPrintCategories = [
    '번호',
    '이름',
    '연수원 아이디',
    '노트북 지참 여부',
    '안내문자 발송용 연락처',
    '직급',
    '학교급',
    '소속',
    '개인정보동의제공 동의',
    '상태',
  ];

  const traineeRequestPrintCategories = baseRequestPrintCategories;
  const nonTraineeRequestPrintCategories = [
    '번호',
    '이름',
    '안내문자 발송용 연락처',
    '소속',
    '직급',
    '개인정보동의제공 동의',
  ];

  const selectOptionCategories = [
    { value: 'trainee', label: '사전 교원연수참가자' },
    { value: 'FIELD', label: '현장신청자' },
    { value: 'PRE', label: '사전 행사참가자' },
  ];

  const [expoData, setExpoData] = useState<Program[]>([]);
  const [selectOption, setSelectOption] = useState<string>('trainee');
  const [requestPrintCategories, setRequestPrintCategories] = useState<
    string[]
  >(traineeRequestPrintCategories);

  useEffect(() => {
    const fetchExpoData = async () => {
      try {
        let endpoint = '';
        let paramsObj: { type?: string } = {};
        if (selectOption === 'trainee') {
          endpoint = `/api/trainee/${id}`;
        } else {
          endpoint = `/api/participant/${id}?${selectOption}`;
          paramsObj = { type: selectOption };
        }

        const response = await axios.get(endpoint, { params: paramsObj });
        setExpoData(response.data);
      } catch (error) {
        console.error('Error fetching expo data:', error);
      }
    };

    fetchExpoData();
  }, [id, selectOption]);

  useEffect(() => {
    if (selectOption === 'trainee') {
      setRequestPrintCategories(traineeRequestPrintCategories);
    } else {
      setRequestPrintCategories(nonTraineeRequestPrintCategories);
    }
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
        actions={fileActions(id)}
      />
    </div>
  );
};

export default ExpoManageForm;
