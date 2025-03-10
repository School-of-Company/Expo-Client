import React from 'react';

type SmallButtonProps = {
  text: string;
  onClick?: () => void;
};

const SmallButton = ({ text, onClick }: SmallButtonProps) => {
  return (
    <button
      className="text-body2 rounded-sm bg-main-600 px-[30px] py-[6px] text-white"
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default SmallButton;
