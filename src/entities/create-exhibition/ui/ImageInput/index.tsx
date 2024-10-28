import React from 'react';
import { Picture } from '@/shared/assets/icons';

const ImageInput = () => {
  return (
    <div>
      <label
        htmlFor="imageUpload"
        className="bg-red flex w-fit cursor-pointer items-center gap-2 rounded-sm border-1 border-solid border-gray-200 px-[30px] py-6 text-body1 text-gray-300"
      >
        <Picture fill="#BDBDBD" />
        사진 가져오기
      </label>
      <input type="file" id="imageUpload" accept="image/*" className="hidden" />
    </div>
  );
};

export default ImageInput;
