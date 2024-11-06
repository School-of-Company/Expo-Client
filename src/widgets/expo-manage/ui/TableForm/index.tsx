import React from 'react';
import { TableHeader, TableItem } from '@/entities/expo-manage';
import TableFooter from '@/entities/expo-manage/ui/TableFooter';

const TableForm = () => {
  return (
    <div className="space-y-[34px] rounded-sm border-1 border-solid border-gray-200 px-[30px] py-6">
      <div className="space-y-[30px] border-b-1 border-solid border-gray-100 pb-6">
        <TableHeader />
        <div className="max-h-[498px] space-y-6 overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-md [&::-webkit-scrollbar-thumb]:bg-main-400 [&::-webkit-scrollbar-track]:rounded-md [&::-webkit-scrollbar-track]:bg-main-100 [&::-webkit-scrollbar]:w-2">
          <TableItem />
          <TableItem />
          <TableItem />
          <TableItem />
          <TableItem />
          <TableItem />
          <TableItem />
          <TableItem />
          <TableItem />
          <TableItem />
          <TableItem />
        </div>
      </div>
      <TableFooter />
    </div>
  );
};

export default TableForm;
