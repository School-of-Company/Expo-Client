import React from 'react';

type SmallButtonProps = {
  text: string;
  onClick?: () => void;
};

const SmallButton = ({ text, onClick }: SmallButtonProps) => {
  return (
    <button
      className="rounded-sm bg-main-600 px-[30px] py-[6px] text-body2 text-white"
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default SmallButton;
