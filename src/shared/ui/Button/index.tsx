'use client';

import React from 'react';

interface Props {
  text: string;
  onClick?: () => void;
  style?: 'default' | 'white' | 'main100';
  type?: 'submit' | 'reset' | 'button' | undefined;
  disabled?: boolean;
  width?: string;
}

const Button = ({
  text,
  onClick,
  style = 'default',
  type,
  disabled,
  width = '100%',
}: Props) => {
  let buttonClass = '';

  if (style === 'white') {
    buttonClass =
      'rounded-sm border-1 border-solid border-main-600 py-3 text-h5 text-main-600';
  } else if (style === 'main100') {
    buttonClass =
      'rounded-sm bg-main-100 border-1 border-solid border-main-600 py-3 text-h5 text-main-600';
  } else {
    buttonClass = 'rounded-sm bg-main-600 py-3 text-h5 text-white';
  }

  if (disabled) {
    buttonClass += ' opacity-50 cursor-not-allowed';
  }

  return (
    <button
      type={type}
      onClick={onClick || (() => {})}
      className={buttonClass}
      disabled={disabled}
      style={{ width }}
    >
      {text}
    </button>
  );
};

export default Button;
