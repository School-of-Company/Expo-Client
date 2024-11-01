import React from 'react';

interface Props {
  text: string;
  onClick: () => void;
}

const Button = ({ text, onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-sm bg-main-600 py-4 text-body1 text-white"
    >
      {text}
    </button>
  );
};

export default Button;
