'use client';

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigationStore } from '@/shared/stores/useNavigationStore';
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
  const { navigation } = useNavigationStore();
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
      />
    </div>
  );
};

export default ProgramDetailForm;
