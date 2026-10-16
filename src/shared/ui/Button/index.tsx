'use client';

import { cva } from 'class-variance-authority';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'white' | 'gray' | 'danger';
  /** small 은 표 위·카드 안의 보조 동작에 쓴다 */
  size?: 'default' | 'small';
  /** 지정하지 않으면 default 는 가로를 채우고 small 은 글자 폭만큼 차지한다 */
  width?: string;
}

const buttonStyles = cva('rounded-sm whitespace-nowrap', {
  variants: {
    variant: {
      default: 'bg-main-600 text-white',
      white: 'border-1 border-solid border-main-600 text-main-600',
      gray: 'bg-gray-100 text-gray-700',
      danger: 'bg-error text-white',
    },
    size: {
      default: 'h-[50px] py-14 text-body1b',
      small: 'px-16 py-8 text-caption1b',
    },
    disabled: {
      true: 'bg-gray-400 opacity-50 cursor-not-allowed',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
    disabled: false,
  },
});

const Button = ({
  children,
  onClick,
  variant = 'default',
  size = 'default',
  disabled,
  width = size === 'small' ? undefined : '100%',
  ...props
}: ButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={buttonStyles({ variant, size, disabled })}
      disabled={disabled}
      style={{ width }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
