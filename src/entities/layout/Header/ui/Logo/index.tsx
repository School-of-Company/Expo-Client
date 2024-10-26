import Link from 'next/link';
import React from 'react';
import { Logo } from '@/shared/assets/svg';

const HeaderLogo = () => {
  return (
    <Link href="/">
      <Logo />
    </Link>
  );
};

export default HeaderLogo;
