import React from 'react';
import { Logo, Navigation } from '@/entities/layout/Header';

const Header = () => {
  return (
    <div className="flex w-full items-center justify-center border-b border-solid border-gray-100 py-7 shadow-[0px_4px_8px_0px_rgba(68,143,255,0.16)] mobile:px-16">
      <div className="flex w-[1200px] items-center justify-between">
        <Logo />
        <Navigation />
      </div>
    </div>
  );
};

export default Header;
