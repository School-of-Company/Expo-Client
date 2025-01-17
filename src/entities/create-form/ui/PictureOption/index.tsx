import React from 'react';
import { FormPicture, XMark } from '@/shared/assets/icons';

const PictureOption = () => {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex w-full items-center gap-[10px]">
        <FormPicture width="16" height="16" />
        <input
          placeholder="문장을 입력해주세요."
          className="w-[60%] text-body4 text-black"
        />
      </div>
      <button>
        <XMark />
      </button>
    </div>
  );
};

export default PictureOption;
