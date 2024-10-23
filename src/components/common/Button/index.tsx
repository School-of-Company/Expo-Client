import React from 'react';

interface Props {
  text: string;
}

const Button = ({ text }: Props) => {
  return (
    <button className="w-full rounded-sm bg-main-600 py-4 text-body1 text-white">
      {text}
    </button>
  );
};

export default Button;
