import { cva, VariantProps } from 'class-variance-authority';
import React from 'react';
import { Check, Trash } from '@/shared/assets/icons';
import SmallButton from '@/shared/ui/SmallButton';

const tableFooterStyles = cva('flex justify-between items-center', {
  variants: {
    type: {
      file: 'flex justify-between',
      default: 'flex gap-6',
      print: 'flex justify-between',
      check: 'flex justify-between',
      delete: 'flex justify-between',
      route: 'flex justify-between',
    },
  },
  defaultVariants: {
    type: 'default',
  },
});

type TableFooterProps = VariantProps<typeof tableFooterStyles> & {
  num: number;
  text?: string;
  actions?: {
    CheckBadge?: (selectItem: number) => void;
    DeleteBadge?: (selectItem: number) => void;
    PrintBadge?: (selectItem: number) => void;
    exportPDF?: () => void;
    exportExcel?: () => void;
    RouteActions?: (selectItem: number) => void;
  };
  selectItem: number | null;
};

const TableFooter = ({
  text = '참가자 전체 인원',
  type = 'default',
  actions,
  num,
  selectItem,
}: TableFooterProps) => {
  const handleCheckClick = () => {
    if (selectItem !== null && actions?.CheckBadge) {
      actions.CheckBadge(selectItem);
    }
  };

  const handleDeleteClick = () => {
    if (selectItem !== null && actions?.DeleteBadge) {
      actions.DeleteBadge(selectItem);
    }
  };

  const handlePrintClick = () => {
    if (selectItem !== null && actions?.PrintBadge) {
      actions.PrintBadge(selectItem);
    }
  };

  const handlePDF = () => {
    if (actions?.exportPDF) {
      actions.exportPDF();
    }
  };

  const handleExcel = () => {
    if (actions?.exportExcel) {
      actions.exportExcel();
    }
  };

  const handleNavigationClick = () => {
    if (selectItem !== null && actions?.RouteActions) {
      actions.RouteActions(selectItem);
    }
  };

  return (
    <div className={tableFooterStyles({ type })}>
      <div className="flex gap-6">
        <p className="text-body2 text-gray-500">{text}</p>
        <p className="text-body2 text-main-600">{num}</p>
      </div>

      {type === 'file' && (
        <div className="flex items-center gap-6">
          <p className="text-body1 text-gray-400">출력</p>
          <SmallButton text="PDF" onClick={handlePDF} />
          <SmallButton text="Excel" onClick={handleExcel} />
        </div>
      )}

      {type === 'print' && (
        <div className="flex items-center gap-6">
          <p className="text-body1 text-gray-400">출력</p>
          <SmallButton text="명찰로 출력하기" onClick={handlePrintClick} />
        </div>
      )}

      {type === 'check' && (
        <div className="mr-5 flex items-center gap-6">
          <button className="flex gap-6" onClick={handleCheckClick}>
            <p className="text-body1 text-gray-400">승인</p>
            <Check />
          </button>
          <button className="flex gap-6" onClick={handleDeleteClick}>
            <p className="text-body1 text-gray-400">삭제</p>
            <Trash />
          </button>
        </div>
      )}

      {type === 'delete' && (
        <div className="mr-5 flex items-center gap-6">
          <button className="flex gap-6" onClick={handleDeleteClick}>
            <p className="text-body1 text-gray-400">삭제</p>
            <Trash />
          </button>
        </div>
      )}
      {type === 'route' && (
        <div className="flex items-center gap-6">
          <p className="text-body1 text-gray-400">페이지 이동</p>
          <SmallButton text="이동하기" onClick={handleNavigationClick} />
        </div>
      )}
    </div>
  );
};

export default TableFooter;
