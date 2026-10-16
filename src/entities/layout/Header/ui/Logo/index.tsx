import Link from 'next/link';
import { Logo } from '@/shared/assets/svg';
import { EXPO_LIST_PATH } from '@/shared/config';

const HeaderLogo = () => {
  return (
    <Link href={EXPO_LIST_PATH} aria-label="박람회 목록으로 이동">
      <Logo />
    </Link>
  );
};

export default HeaderLogo;
