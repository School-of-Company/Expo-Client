import Image from 'next/image';
import React, { useState } from 'react';
import { UseFormRegisterReturn, UseFormSetValue } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Picture } from '@/shared/assets/icons';
import { ExhibitionFormData } from '@/shared/types/exhibition/create/type';
import WarningMessage from '../WarningMessage';

interface ImageInputProps {
  register: UseFormRegisterReturn;
  setValue: UseFormSetValue<ExhibitionFormData>;
  id: string;
  defaultImage?: string | File | null;
}

const ImageInput = ({ register, setValue, defaultImage }: ImageInputProps) => {
  const [img, setImg] = useState<string | null>(() => {
    if (typeof defaultImage === 'string') {
      return defaultImage;
    } else if (defaultImage instanceof File) {
      return URL.createObjectURL(defaultImage);
    }
    return null;
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];

    if (file) {
      const imgElement = new window.Image();
      imgElement.src = URL.createObjectURL(file);

      imgElement.onload = () => {
        if (imgElement.width < 750 || imgElement.height < 360) {
          toast.error('이미지의 최소 크기는 750x360이어야 합니다.');
          return;
        }

        setImg(URL.createObjectURL(file));
        setValue('image', file);
      };

      register.onChange(e);
    }
  };

  return (
    <div className="space-y-3">
      <label
        htmlFor="imageUpload"
        className={`relative flex h-[360px] w-full cursor-pointer items-center justify-center rounded-sm px-[30px] py-6 ${
          img ? '' : 'border-2 border-dashed border-main-300'
        }`}
      >
        {img ? (
          <Image
            src={img}
            alt="미리보기 이미지"
            layout="fill"
            objectFit="cover"
            className="rounded-sm"
          />
        ) : (
          <div className="text-h1 flex items-center justify-center gap-2 text-gray-300">
            <Picture fill="#BDBDBD" />
            사진 가져오기
          </div>
        )}
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </label>
      <WarningMessage text="이미지 등록시 750 × 360 사이즈로 등록해주세요" />
    </div>
  );
};

export default ImageInput;
