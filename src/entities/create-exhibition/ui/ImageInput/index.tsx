import Image from 'next/image';
import { Picture } from '@/shared/assets/icons';

interface ImageInputProps {
  img: string | null;
  setImg: React.Dispatch<React.SetStateAction<string | null>>;
}

const ImageInput = ({ img, setImg }: ImageInputProps) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);

      setImg(fileURL);
    }
  };

  return (
    <div>
      {img ? (
        <div className="mb-4 w-full max-w-xs">
          <Image
            src={img}
            alt="미리보기 이미지"
            layout="intrinsic"
            width={200}
            height={150}
            objectFit="cover"
          />
        </div>
      ) : null}

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
    </div>
  );
};

export default ImageInput;
