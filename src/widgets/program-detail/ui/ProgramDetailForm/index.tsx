'use client';

import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { fileActions } from '@/shared/model/footerActions';
import { TableForm } from '@/shared/ui/Table';

interface TrainingProgram {
  id: number;
  name: string;
  affiliation: string;
  position: string;
  programName: string;
  status: boolean;
  entryTime: string;
  leaveTime: string;
}

interface StandardProgram {
  id: number;
  name: string;
  affiliation: string;
  position: string;
  programName: string;
  status: boolean;
  entryTime: string;
  leaveTime: string;
}

const ProgramDetailForm = ({ id }: { id: number }) => {
  const searchParams = useSearchParams();
  const navigation = searchParams.get('navigation') || 'standard';
  const [data, setData] = useState<TrainingProgram[] | StandardProgram[]>([]);

  useEffect(() => {
    const fetchDetailData = async () => {
      try {
        const endpoint =
          navigation === 'training'
            ? `/api/training/${id}`
            : `/api/standard/${id}`;

        const response = await axios.get(endpoint);

        setData(response.data);
      } catch (error) {
        console.error('Error fetching program detail data:', error);
      }
    };

    fetchDetailData();
  }, [id, navigation]);

  const programCategories = [
    '번호',
    '성명',
    '소속',
    '직급',
    '프로그램 이름',
    '출석 여부',
    '입실 시간',
    '퇴실 시간',
  ];

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-[46px] px-5">
      <p className="text-center text-h2 text-black">프로그램</p>
      <TableForm
        categories={programCategories}
        data={data}
        maxHeight="414px"
        footerType="file"
        text="인원 수"
        actions={fileActions(id)}
      />
    </div>
  );
};

export default ProgramDetailForm;
