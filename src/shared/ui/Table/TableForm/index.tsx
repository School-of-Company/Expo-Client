import React from 'react';
import { TableFooter, TableHeader, TableItem } from '@/shared/ui/Table';

interface Props {
  footerType: 'default' | 'file' | 'print';
}

const TableForm = ({ footerType }: Props) => {
  return (
    <div className="space-y-[34px] rounded-sm border-1 border-solid border-gray-200 px-[30px] py-6">
      <div className="space-y-[30px] border-b-1 border-solid border-gray-100 pb-6">
        <TableHeader />
        <div className="space-y-6 overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-md [&::-webkit-scrollbar-thumb]:bg-main-400 [&::-webkit-scrollbar-track]:rounded-md [&::-webkit-scrollbar-track]:bg-main-100 [&::-webkit-scrollbar]:w-2">
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
      <TableFooter type={footerType} />
    </div>
  );
};

export default TableForm;
