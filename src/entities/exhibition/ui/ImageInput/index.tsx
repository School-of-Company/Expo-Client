import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { UseFormRegisterReturn, UseFormSetValue } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Picture } from '@/shared/assets/icons';
import { COLORS } from '@/shared/config';
import { isValidSrc } from '@/shared/model';
import { ExhibitionFormData } from '@/shared/types/exhibition/type';
import WarningMessage from '../WarningMessage';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
// Swagger에 업로드 한도가 명시돼 있지 않아 10MB로 잡는다
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

interface ImageInputProps {
  register: UseFormRegisterReturn;
  setValue: UseFormSetValue<ExhibitionFormData>;
  id: string;
  defaultImage?: string | File | null;
}

const ImageInput = ({ register, setValue, defaultImage }: ImageInputProps) => {
  // 이 컴포넌트가 만든 미리보기 blob 주소. 바꾸거나 언마운트할 때 해제한다
  const objectUrlRef = useRef<string | null>(null);

  const [img, setImg] = useState<string | null>(() => {
    if (typeof defaultImage === 'string') {
      return defaultImage;
    } else if (defaultImage instanceof File) {
      objectUrlRef.current = URL.createObjectURL(defaultImage);
      return objectUrlRef.current;
    }
    return null;
  });

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];

    if (file) {
      // 서버는 JPEG·PNG만 받고(그 외 415) 크기 초과는 413으로 거절하므로 미리 막는다
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error('JPEG 또는 PNG 이미지만 등록할 수 있습니다.');
        e.target.value = '';
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error('이미지는 10MB 이하로 등록해주세요.');
        e.target.value = '';
        return;
      }

      // onload·onerror 는 이벤트가 끝난 뒤 불리므로 input 을 미리 잡아 둔다
      const input = e.target;
      const objectUrl = URL.createObjectURL(file);
      const imgElement = new window.Image();

      // 거절한 파일도 다시 고를 수 있게 input 을 비우고 주소를 해제한다
      const reject = (message: string) => {
        toast.error(message);
        URL.revokeObjectURL(objectUrl);
        input.value = '';
      };

      imgElement.onload = () => {
        if (imgElement.width < 750 || imgElement.height < 360) {
          reject('이미지의 최소 크기는 750x360이어야 합니다.');
          return;
        }

        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = objectUrl;
        setImg(objectUrl);
        setValue('image', file);
      };
      imgElement.onerror = () => {
        reject('이미지를 불러오지 못했습니다. 다른 이미지를 선택해주세요.');
      };
      imgElement.src = objectUrl;

      register.onChange(e);
    }
  };

  return (
    <div className="space-y-3">
      <label
        htmlFor="imageUpload"
        className={`relative flex h-[360px] w-full cursor-pointer items-center justify-center rounded-sm px-[30px] py-6 ${
          isValidSrc(img) ? '' : 'border-2 border-dashed border-main-300'
        }`}
      >
        {isValidSrc(img) ? (
          <Image
            src={img!}
            alt="미리보기 이미지"
            layout="fill"
            objectFit="cover"
            className="rounded-sm"
          />
        ) : (
          <div className="text-h1 flex items-center justify-center gap-2 text-gray-300">
            <Picture fill={COLORS.gray300} />
            사진 가져오기
          </div>
        )}
        <input
          type="file"
          id="imageUpload"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={handleImageChange}
        />
      </label>
      <WarningMessage text="이미지 등록시 750 × 360 사이즈로 등록해주세요" />
    </div>
  );
};

export default ImageInput;
