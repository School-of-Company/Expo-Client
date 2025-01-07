import React from 'react';
import { Logo, Navigation } from '@/entities/layout/Header';

const Header = () => {
  return (
    <div className="mx-auto flex w-full py-5">
      <div className="mx-auto flex w-[1200px] items-center justify-between px-5">
        <Logo />
        <Navigation />
      </div>
    </div>
  );
};

export default Header;
