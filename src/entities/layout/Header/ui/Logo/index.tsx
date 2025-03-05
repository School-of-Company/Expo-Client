import Link from 'next/link';
import React from 'react';
import { Logo } from '@/shared/assets/svg';

const HeaderLogo = () => {
  return (
    <Link href="/" aria-label="홈으로 이동">
      <Logo />
    </Link>
  );
};

export default HeaderLogo;
