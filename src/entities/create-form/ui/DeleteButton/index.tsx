import React from 'react';
import { Trash } from '@/shared/assets/icons';

const DeleteButton = () => {
  return (
    <button className="flex items-center gap-2">
      <Trash color="#BDBDBD" />
      <p className="text-caption2 text-gray-300">버리기</p>
    </button>
  );
};

export default DeleteButton;
