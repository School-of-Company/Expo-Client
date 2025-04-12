'use client';

import React, { useState } from 'react';
import { TableFooter, TableHeader, TableItem } from '@/shared/ui/Table';
import NavigationBar from '../../NavigationBar';

interface Props<T> {
  data: T[];
  footerType: 'default' | 'file' | 'print' | 'check' | 'delete' | 'route';
  maxHeight?: string;
  categories: string[];
  text?: string;
  actions?: { [key: string]: (selectItem: number) => void };
  totalPage?: number;
  id?: string;
}

const TableForm = <T extends { id: number }>({
  footerType,
  maxHeight = '500px',
  data,
  categories,
  text,
  actions,
  totalPage,

  id,
}: Props<T>) => {
  const [selectItem, setSelectItem] = useState<number | null>(null);

  return (
    <div className="space-y-[34px] rounded-sm border-1 border-solid border-gray-200 px-30 py-20">
      <div className="space-y-[30px] border-b-1 border-solid border-gray-100 pb-6">
        <TableHeader categories={categories} />
        <div className="space-y-20 overflow-y-auto" style={{ maxHeight }}>
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
      {id && totalPage ? (
        <div className="flex justify-center">
          <NavigationBar id={id} totalPage={totalPage} />
        </div>
      ) : null}

      <TableFooter
        type={footerType}
        text={text}
        num={data.length}
        actions={actions}
        selectItem={selectItem}
        setSelectItem={setSelectItem}
      />
    </div>
  );
};

export default TableForm;
