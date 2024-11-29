'use client';

import React from 'react';
import { fileActions } from '@/shared/model/footerActions';
import { TableForm } from '@/shared/ui/Table';

const ProgramForm = ({ params }: { params: { id: string } }) => {
  const requestPrintCategories = ['번호', '프로그램', '선택', '필수'];
  console.log(params);

  return (
    <div>
      <TableForm
        categories={requestPrintCategories}
        data={[]}
        maxHeight="414px"
        footerType="print"
        text="QR 스캔"
        actions={fileActions}
      />
    </div>
  );
};

export default ProgramForm;
