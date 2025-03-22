'use client';

import { cva } from 'class-variance-authority';
import React from 'react';

interface Props {
  text: string;
  onClick?: () => void;
  style?: 'default' | 'white' | 'main100';
  type?: 'submit' | 'reset' | 'button' | undefined;
  disabled?: boolean;
  width?: string;
}

const buttonStyles = cva('rounded-sm py-3 text-h5', {
  variants: {
    style: {
      default: 'bg-main-600 text-white',
      white: 'border-1 border-solid border-main-600 text-main-600',
      main100:
        'bg-main-100 border-1 border-solid border-main-600 text-main-600',
    },
    disabled: {
      true: 'opacity-50 cursor-not-allowed',
      false: '',
    },
  },
  defaultVariants: {
    style: 'default',
    disabled: false,
  },
});

const Button = ({
  text,
  onClick,
  style = 'default',
  type,
  disabled,
  width = '100%',
}: Props) => {
  return (
    <button
      type={type}
      onClick={onClick || (() => {})}
      className={buttonStyles({ style, disabled })}
      disabled={disabled}
      style={{ width }}
    >
      {text}
    </button>
  );
};

export default Button;
