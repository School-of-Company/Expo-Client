import Image from 'next/image';
import { useState } from 'react';
import { Picture } from '@/shared/assets/icons';

interface ImageInputProps {
  img: string | null;
  setImg: React.Dispatch<React.SetStateAction<string | null>>;
}

const ImageInput = ({ img, setImg }: ImageInputProps) => {
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];

    if (file) {
      const imgElement = new window.Image();
      imgElement.src = URL.createObjectURL(file);

      imgElement.onload = () => {
        if (imgElement.width < 750 || imgElement.height < 360) {
          setError('이미지의 최소 크기는 750x360이어야 합니다.');
          return;
        }

        setImg(URL.createObjectURL(file));
        setError(null);
      };
    }
  };

  return (
    <div>
      {img && (
        <div className="mb-4 w-full max-w-xs">
          <Image
            src={img}
            alt="미리보기 이미지"
            layout="responsive"
            width={300}
            height={200}
            objectFit="cover"
          />
        </div>
      )}

      <label
        htmlFor="imageUpload"
        className="bg-red flex w-fit cursor-pointer items-center gap-2 rounded-sm border-1 border-solid border-gray-200 px-[30px] py-6 text-body1 text-gray-300"
      >
        <Picture fill="#BDBDBD" />
        사진 가져오기
      </label>
      <input
        type="file"
        id="imageUpload"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />

      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
};

export default ImageInput;
