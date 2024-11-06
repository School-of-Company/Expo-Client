'use client';

import React from 'react';

interface Props {
  text: string;
  onClick?: () => void;
  style?: 'default' | 'white' | 'main100';
  type?: 'submit' | 'reset' | 'button' | undefined;
  disabled?: boolean;
}

const Button = ({
  text,
  onClick,
  style = 'default',
  type,
  disabled,
}: Props) => {
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

  // 비활성화 상태일 때 스타일 추가
  if (disabled) {
    buttonClass += ' opacity-50 cursor-not-allowed';
  }

  return (
    <button
      type={type}
      onClick={onClick || (() => {})}
      className={buttonClass}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default Button;
