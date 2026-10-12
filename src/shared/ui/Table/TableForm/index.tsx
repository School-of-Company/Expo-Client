'use client';

import { useState } from 'react';
import { TableFooter, TableHeader, TableItem } from '@/shared/ui/Table';
import NavigationBar from '../../NavigationBar';

interface Props<
  T extends { id: string | number },
  K extends string | number = T['id'],
> {
  data: T[];
  // 선택·행 구분에 쓰는 키. id가 행마다 유일하지 않을 때만 넘긴다
  getRowKey?: (item: T) => K;
  footerType: 'default' | 'file' | 'print' | 'check' | 'delete' | 'route';
  maxHeight?: string;
  categories: string[];
  text?: string;
  actions?: { [key: string]: (selectItem: K) => void };
  totalPage?: number;
  totalCount?: number;
  id?: string;
  selectItemBoolean?: boolean;
  setSelectItem?: React.Dispatch<React.SetStateAction<K | null>>;
  selectItem?: K | null;
}

const TableForm = <
  T extends { id: string | number },
  K extends string | number = T['id'],
>({
  footerType,
  maxHeight = '500px',
  data,
  getRowKey = (item: T) => item.id as K,
  categories,
  text,
  actions,
  totalPage,
  totalCount,
  id,
  selectItemBoolean = true,
  setSelectItem,
  selectItem,
}: Props<T, K>) => {
  const [selectItemState, setSelectItemState] = useState<K | null>(null);
  return (
    <div className="space-y-[34px] rounded-sm border-1 border-solid border-gray-200 px-30 py-20">
      <div className="space-y-[30px] overflow-x-auto border-b-1 border-solid border-gray-100 pb-6">
        <div className="min-w-[800px]">
          <TableHeader categories={categories} />
          <div
            className="space-y-20 overflow-y-auto pt-6"
            style={{ maxHeight }}
          >
            {data.map((item) => (
              <TableItem
                state={selectItem ?? selectItemState}
                setState={setSelectItem ?? setSelectItemState}
                key={getRowKey(item)}
                rowKey={getRowKey(item)}
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
        num={totalCount ?? data.length}
        actions={actions}
        selectItem={selectItem ?? selectItemState}
        setSelectItem={setSelectItem ?? setSelectItemState}
        selectItemBoolean={selectItemBoolean}
      />
    </div>
  );
};

export default TableForm;
