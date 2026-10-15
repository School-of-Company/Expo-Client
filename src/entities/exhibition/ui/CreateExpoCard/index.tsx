import Link from 'next/link';
import { Plus } from '@/shared/assets/icons';
import { COLORS } from '@/shared/config';

/** 박람회 목록 카드(ExpoListItem)와 같은 크기의 생성 카드 */
const CreateExpoCard = () => {
  return (
    <Link
      href="/exhibition/create"
      className="flex h-[150px] items-center justify-center gap-12 rounded-sm border-1 border-dashed border-gray-300 bg-white p-18 duration-200 hover:border-main-600"
    >
      <Plus fill={COLORS.main600} />
      <p className="text-body1b text-main-600">박람회 생성하기</p>
    </Link>
  );
};

export default CreateExpoCard;
