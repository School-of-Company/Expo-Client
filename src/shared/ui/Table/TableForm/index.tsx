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
  selectItemBoolean?: boolean;
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
  selectItemBoolean = true,
}: Props<T>) => {
  const [selectItem, setSelectItem] = useState<number | null>(null);

  return (
    <div className="space-y-[34px] rounded-sm border-1 border-solid border-gray-200 px-30 py-20">
      <div className="space-y-[30px] overflow-x-auto border-b-1 border-solid border-gray-100 pb-6">
        <div className="min-w-[800px]">
          <TableHeader categories={categories} />
          <div
            className="space-y-20 overflow-y-auto pt-6"
            style={{ maxHeight }}
          >
            {data.map((item, index) => (
              <TableItem
                state={selectItem}
                setState={setSelectItem}
                key={index}
                data={item}
                selectItemBoolean={selectItemBoolean}
                categories={categories}
              />
            ))}
          </div>
        </div>
      </div>
      {id && totalPage ? (
        <div className="flex justify-center">
          <NavigationBar totalPage={totalPage} />
        </div>
      ) : null}

      <TableFooter
        type={footerType}
        text={text}
        num={data.length}
        actions={actions}
        selectItem={selectItem}
        setSelectItem={setSelectItem}
        selectItemBoolean={selectItemBoolean}
      />
    </div>
  );
};

export default TableForm;
