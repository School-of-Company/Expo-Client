import React from 'react';
import { Logo, Navigation } from '@/entities/layout/Header';

const Header = () => {
  return (
    <div className="flex h-[90px] w-full items-center justify-around py-[30px]">
      <Logo />
      <Navigation />
    </div>
  );
};

export default Header;
