'use client';

import React from 'react';

interface Props {
  text: string;
  onClick?: () => void;
  style?: 'default' | 'white' | 'main100';
  type?: 'submit' | 'reset' | 'button' | undefined;
}

const Button = ({ text, onClick, style = 'default', type }: Props) => {
  let buttonClass = '';

  if (style === 'white') {
    buttonClass =
      'w-full rounded-sm border-1 border-solid border-main-600 py-3 text-h5 text-main-600';
  } else if (style === 'main100') {
    buttonClass =
      'w-full rounded-sm bg-main-100 border-1 border-solid border-main-600 py-3 text-h5 text-main-600';
  } else {
    buttonClass = 'w-full rounded-sm bg-main-600 py-3 text-h5 text-white';
  }

  return (
    <button type={type} onClick={onClick || (() => {})} className={buttonClass}>
      {text}
    </button>
  );
};

export default Button;
