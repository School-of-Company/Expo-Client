import React from 'react';
import { Trash } from '@/shared/assets/icons';

interface Props {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const DeleteButton = ({ onClick }: Props) => {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-8">
      <Trash />
      <p className="text-caption2 text-error">버리기</p>
    </button>
  );
};

export default DeleteButton;
