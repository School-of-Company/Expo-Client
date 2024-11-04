import React from 'react';

interface Props {
  children: React.ReactNode;
}

const ModalLayout = ({ children }: Props) => {
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
