'use client';

import { cva } from 'class-variance-authority';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'white' | 'main100';
  width?: string;
}

const buttonStyles = cva(
  'rounded-sm py-14 text-body1b h-[50px] whitespace-nowrap',
  {
    variants: {
      variant: {
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
      variant: 'default',
      disabled: false,
    },
  },
);

const Button = ({
  children,
  onClick,
  variant = 'default',
  disabled,
  width = '100%',
  ...props
}: ButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={buttonStyles({ variant, disabled })}
      disabled={disabled}
      style={{ width }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
