import { cva } from 'class-variance-authority';

interface TextButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** gray 는 초기화처럼 눈에 덜 띄어야 하는 동작에 쓴다 */
  tone?: 'main' | 'gray';
  size?: 'default' | 'small';
}

const textButtonStyles = cva(
  'whitespace-nowrap underline disabled:cursor-not-allowed disabled:text-gray-300 disabled:no-underline',
  {
    variants: {
      tone: {
        main: 'text-main-600',
        gray: 'text-gray-500',
      },
      size: {
        default: 'text-body2r',
        small: 'text-caption1r',
      },
    },
    defaultVariants: {
      tone: 'main',
      size: 'default',
    },
  },
);

/** 새로고침·더 보기처럼 밑줄 글자로 보이는 보조 버튼 */
const TextButton = ({
  tone,
  size,
  className = '',
  type = 'button',
  ...props
}: TextButtonProps) => (
  <button
    type={type}
    className={`${textButtonStyles({ tone, size })} ${className}`}
    {...props}
  />
);

export default TextButton;
