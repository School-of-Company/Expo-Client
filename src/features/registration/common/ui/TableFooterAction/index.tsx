import { ReactNode } from 'react';

interface TableFooterActionProps {
  text: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

/** shared TableFooter 의 승인/삭제 버튼과 같은 모양의 액션 */
const TableFooterAction = ({
  text,
  icon,
  onClick,
  disabled,
}: TableFooterActionProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex items-center gap-8 disabled:opacity-40"
  >
    <p className="text-body1r text-gray-400 mobile:text-caption1r">{text}</p>
    {icon}
  </button>
);

export default TableFooterAction;
