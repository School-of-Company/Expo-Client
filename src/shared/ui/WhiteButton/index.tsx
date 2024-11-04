'use client';

import React from 'react';

interface Props {
  text: string;
  onClick?: () => void;
}

const WhiteButton = ({ text, onClick }: Props) => {
  return (
    <button
      onClick={onClick || (() => {})}
      className="w-full rounded-sm border-1 border-solid border-gray-100 py-3 text-h5 text-gray-300"
    >
      {text}
    </button>
  );
};

export default WhiteButton;
