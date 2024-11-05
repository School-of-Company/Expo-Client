import React from 'react';
import { TableHeader } from '@/entities/expo-manage';

const TableForm = () => {
  return (
    <div className="space-y-[34px] rounded-sm border-1 border-solid border-gray-200 px-[30px] py-6">
      <div className="space-y-[30px] border-b-1 border-solid border-gray-100 pb-6">
        <TableHeader />
        <div className="space-y-6">
          <div className="bg-blue-400">테이블 아이템</div>
          <div className="bg-blue-400">테이블 아이템</div>
          <div className="bg-blue-400">테이블 아이템</div>
          <div className="bg-blue-400">테이블 아이템</div>
        </div>
      </div>
      <div className="bg-yellow-300 px-6">테이블 푸터</div>
    </div>
  );
};

export default TableForm;
