'use client';

import React, { useEffect } from 'react';

interface Props {
  children: React.ReactNode;
}

const ModalLayout = ({ children }: Props) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center px-[18px]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      {children}
    </div>
  );
};

export default ModalLayout;
