import React from 'react';
import { TableHeader, TableItem } from '@/entities/expo-manage';
import TableFooter from '@/entities/expo-manage/ui/TableFooter';

const TableForm = () => {
  return (
    <div className="space-y-[34px] rounded-sm border-1 border-solid border-gray-200 px-[30px] py-6">
      <div className="space-y-[30px] border-b-1 border-solid border-gray-100 pb-6">
        <TableHeader />
        <div className="space-y-6">
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
