import { cva, VariantProps } from 'class-variance-authority';
import React from 'react';
import SmallButton from '@/shared/ui/SmallButton';

const tableFooterStyles = cva('flex justify-between items-center', {
  variants: {
    type: {
      file: 'flex justify-between',
      default: 'flex gap-6',
      print: 'flex justify-between',
    },
  },
  defaultVariants: {
    type: 'default',
  },
});

type TableFooterProps = VariantProps<typeof tableFooterStyles> & {
  num?: number;
};

const TableFooter = ({ type = 'default', num = 100 }: TableFooterProps) => {
  return (
    <div className={tableFooterStyles({ type })}>
      <div className="flex gap-6">
        <p className="text-body2 text-gray-500">참가자 전체 인원</p>
        <p className="text-body2 text-main-600">{num}명</p>
      </div>

      {type === 'file' && (
        <div className="flex items-center gap-6">
          <p className="text-body1 text-gray-400">출력</p>
          <SmallButton text="PDF" />
          <SmallButton text="Exel" />
        </div>
      )}

      {type === 'print' && (
        <div className="flex items-center gap-6">
          <p className="text-body1 text-gray-400">출력</p>
          <SmallButton text="명찰로 출력하기" />
        </div>
      )}
    </div>
  );
};

export default TableFooter;
