'use client';

import React from 'react';
import { fileActions } from '@/shared/model/footerActions';
import { TableForm } from '@/shared/ui/Table';

const ProgramDetailForm = ({ id }: { id: number }) => {
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
        data={[]}
        maxHeight="414px"
        footerType="file"
        text="인원 수"
        actions={fileActions(id)}
      />
    </div>
  );
};

export default ProgramDetailForm;
