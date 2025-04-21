import { cva, VariantProps } from 'class-variance-authority';
import React from 'react';
import { Check, Trash } from '@/shared/assets/icons';
import SmallButton from '@/shared/ui/SmallButton';

type ActionKeys =
  | 'CheckBadge'
  | 'DeleteBadge'
  | 'PrintBadge'
  | 'exportExcel'
  | 'RouteActions';
type ActionsType = Partial<Record<ActionKeys, (selectItem: number) => void>>;

type TableFooterProps = VariantProps<typeof tableFooterStyles> & {
  num: number;
  text?: string;
  actions?: ActionsType;
  selectItem: number | null;
  setSelectItem: React.Dispatch<React.SetStateAction<number | null>>;
  selectItemBoolean: boolean;
};

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

const TableFooter = ({
  text = '참가자 전체 인원',
  type = 'default',
  actions = {},
  num,
  selectItem,
  setSelectItem,
  selectItemBoolean,
}: TableFooterProps) => {
  const handleActionClick = (actionKey: ActionKeys) => {
    const isDisabled = selectItemBoolean !== false && selectItem === null;

    if (!isDisabled && actions[actionKey]) {
      actions[actionKey]!(selectItem!);
      setSelectItem(null);
    }
  };

  return (
    <div className={tableFooterStyles({ type })}>
      <div className="flex gap-20 mobile:gap-12">
        <p className="text-body2r text-gray-500 mobile:text-caption1r">
          {text}
        </p>
        <p className="text-body2r text-main-600 mobile:text-caption1r">{num}</p>
      </div>

      {type === 'file' && (
        <div className="flex items-center gap-20 mobile:gap-16">
          <p className="text-body1r text-gray-400">출력</p>
          <SmallButton
            text="Excel"
            onClick={() => handleActionClick('exportExcel')}
          />
        </div>
      )}

      {type === 'print' && (
        <div className="flex items-center gap-20 mobile:gap-16">
          <p className="text-body2r text-gray-400 mobile:text-caption1r">
            출력
          </p>
          <SmallButton
            text="QR출력"
            onClick={() => handleActionClick('PrintBadge')}
          />
        </div>
      )}

      {type === 'check' && (
        <div className="flex items-center gap-20 mobile:gap-16">
          <button
            type="button"
            className="flex items-center gap-20 mobile:gap-8"
            onClick={() => handleActionClick('CheckBadge')}
          >
            <p className="text-body1r text-gray-400 mobile:text-caption1r">
              승인
            </p>
            <Check />
          </button>
          <button
            type="button"
            className="flex items-center gap-20 mobile:gap-8"
            onClick={() => handleActionClick('DeleteBadge')}
          >
            <p className="text-body1r text-gray-400 mobile:text-caption1r">
              삭제
            </p>
            <Trash />
          </button>
        </div>
      )}

      {type === 'delete' && (
        <div className="flex items-center gap-20 mobile:gap-8">
          <button
            type="button"
            className="flex items-center gap-20"
            onClick={() => handleActionClick('DeleteBadge')}
          >
            <p className="text-body1r text-gray-400 mobile:text-caption1r">
              삭제
            </p>
            <Trash />
          </button>
        </div>
      )}
      {type === 'route' && (
        <div className="flex items-center gap-20">
          <SmallButton
            text="이동"
            onClick={() => handleActionClick('RouteActions')}
          />
        </div>
      )}
    </div>
  );
};

export default TableFooter;
