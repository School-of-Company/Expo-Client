import React, { useState } from 'react';
import { TableFooter, TableHeader, TableItem } from '@/shared/ui/Table';

interface Props<T extends { id: number }> {
  data: T[];
  footerType: 'default' | 'file' | 'print' | 'check' | 'delete';
  maxHeight?: string;
  categories: string[];
  text?: string;
  actions?: { [key: string]: (selectItem: number) => void };
}

const TableForm = <T extends { id: number }>({
  footerType,
  maxHeight = '500px',
  data,
  categories,
  text,
  actions,
}: Props<T>) => {
  const [selectItem, setSelectItem] = useState<number | null>(null);

  return (
    <div className="space-y-[34px] rounded-sm border-1 border-solid border-gray-200 px-[30px] py-6">
      <div className="space-y-[30px] border-b-1 border-solid border-gray-100 pb-6">
        <TableHeader categories={categories} />
        <div
          className="space-y-6 overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-md [&::-webkit-scrollbar-thumb]:bg-main-400 [&::-webkit-scrollbar-track]:rounded-md [&::-webkit-scrollbar-track]:bg-main-100 [&::-webkit-scrollbar]:w-2"
          style={{ maxHeight }}
        >
          {data.map((item, index) => (
            <TableItem
              state={selectItem}
              setState={setSelectItem}
              key={index}
              data={item}
            />
          ))}
        </div>
      </div>
      <TableFooter
        type={footerType}
        text={text}
        num={data.length}
        actions={actions}
        selectItem={selectItem}
      />
    </div>
  );
};

export default TableForm;
