import React from 'react';
import { Plus } from '@/shared/assets/icons';

interface Props {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const CreateFormButton = ({ onClick }: Props) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-fit items-center gap-[10px] rounded-sm bg-main-300 px-6 py-3"
    >
      <Plus fill="#FFF" />
      <p className="text-h4 text-white">추가하기</p>
    </button>
  );
};

export default CreateFormButton;
