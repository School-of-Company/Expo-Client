import React from 'react';
import { TableFooter, TableHeader, TableItem } from '@/shared/ui/Table';

interface Props<T> {
  data: T[];
  footerType: 'default' | 'file' | 'print';
  maxHeight?: string;
  categories: string[];
}

const TableForm = <T extends Record<string, unknown>>({
  footerType,
  maxHeight = '500px',
  data,
  categories,
}: Props<T>) => {
  return (
    <div className="space-y-[34px] rounded-sm border-1 border-solid border-gray-200 px-[30px] py-6">
      <div className="space-y-[30px] border-b-1 border-solid border-gray-100 pb-6">
        <TableHeader categories={categories} />
        <div
          className="space-y-6 overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-md [&::-webkit-scrollbar-thumb]:bg-main-400 [&::-webkit-scrollbar-track]:rounded-md [&::-webkit-scrollbar-track]:bg-main-100 [&::-webkit-scrollbar]:w-2"
          style={{ maxHeight }}
        >
          {data.map((item, index) => (
            <TableItem key={index} data={item} />
          ))}
        </div>
      </div>
      <TableFooter type={footerType} />
    </div>
  );
};

export default TableForm;
