import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { UseFormRegisterReturn, UseFormSetValue } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Picture } from '@/shared/assets/icons';
import { COLORS } from '@/shared/config';
import { isValidSrc } from '@/shared/model';
import { ExhibitionFormData } from '@/shared/types/exhibition/type';
import WarningMessage from '../WarningMessage';

// 서버 ImageFileValidator 와 같은 규칙. 형식(415)·용량(413)·확장자·크기(400)가 어긋나면 서버가 거절한다
// 형식별로 허용하는 확장자
const ALLOWED_IMAGE_EXTENSIONS = new Map([
  ['image/jpeg', ['jpg', 'jpeg']],
  ['image/png', ['png']],
]);
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 8000;
const MAX_IMAGE_PIXELS = 20_000_000;

interface ImageInputProps {
  // 부모가 register('image', { required }) 로 필드와 검증 규칙을 등록한다. 값은 검사를 통과한 파일만 setValue 로 넣는다
  register: UseFormRegisterReturn;
  setValue: UseFormSetValue<ExhibitionFormData>;
  id: string;
  defaultImage?: string | File | null;
}

const ImageInput = ({ setValue, defaultImage }: ImageInputProps) => {
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
      // 서버는 JPEG·PNG만 받고(그 외 415) 확장자(jpg·jpeg·png)도 형식과 맞아야 하므로 미리 막는다
      const dot = file.name.lastIndexOf('.');
      const extension = dot < 0 ? '' : file.name.slice(dot + 1).toLowerCase();
      if (!ALLOWED_IMAGE_EXTENSIONS.get(file.type)?.includes(extension)) {
        toast.error('JPEG 또는 PNG 이미지만 등록할 수 있습니다.');
        e.target.value = '';
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error('이미지는 5MB 이하로 등록해주세요.');
        e.target.value = '';
        return;
      }

      // onload·onerror 는 이벤트가 끝난 뒤 불리므로 input 을 미리 잡아 둔다
      const input = e.target;
      const objectUrl = URL.createObjectURL(file);
      const imgElement = new window.Image();

      // 거절한 파일도 다시 고를 수 있게 input 을 비우고 주소를 해제한다.
      // 폼 값은 통과한 파일만 넣으므로 거절하면 이전에 고른 이미지가 그대로 남는다
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
        if (
          imgElement.width > MAX_IMAGE_DIMENSION ||
          imgElement.height > MAX_IMAGE_DIMENSION ||
          imgElement.width * imgElement.height > MAX_IMAGE_PIXELS
        ) {
          reject(
            '이미지는 가로·세로 8000px 이하, 전체 2,000만 화소 이하로 등록해주세요.',
          );
          return;
        }

        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = objectUrl;
        setImg(objectUrl);
        setValue('image', file, { shouldValidate: true, shouldDirty: true });
      };
      imgElement.onerror = () => {
        reject('이미지를 불러오지 못했습니다. 다른 이미지를 선택해주세요.');
      };
      imgElement.src = objectUrl;
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
