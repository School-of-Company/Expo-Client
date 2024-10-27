import React from 'react';
import { Logo, Navigation } from '@/entities/layout/Header';

const Header = () => {
  return (
    <div className="mx-auto flex h-[90px] w-full">
      <div className="mx-auto flex w-[1200px] items-center justify-between mobile:px-5">
        <Logo />
        <Navigation />
      </div>
    </div>
  );
};

export default Header;
