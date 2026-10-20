import Link from 'next/link';
import { Logo } from '@/shared/assets/svg';

const HeaderLogo = () => {
  return (
    <Link href="/admin" aria-label="홈으로 이동">
      <Logo />
    </Link>
  );
};

export default HeaderLogo;
