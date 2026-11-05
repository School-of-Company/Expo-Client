interface QrCodeProps {
  fill?: string;
  width?: string;
  height?: string;
  className?: string;
}

const QrCode = ({
  width = '24',
  height = '24',
  fill = '#121212',
  className,
}: QrCodeProps) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 4.5C3 3.67 3.67 3 4.5 3H9C9.83 3 10.5 3.67 10.5 4.5V9C10.5 9.83 9.83 10.5 9 10.5H4.5C3.67 10.5 3 9.83 3 9V4.5ZM4.5 4.5V9H9V4.5H4.5ZM13.5 4.5C13.5 3.67 14.17 3 15 3H19.5C20.33 3 21 3.67 21 4.5V9C21 9.83 20.33 10.5 19.5 10.5H15C14.17 10.5 13.5 9.83 13.5 9V4.5ZM15 4.5V9H19.5V4.5H15ZM3 15C3 14.17 3.67 13.5 4.5 13.5H9C9.83 13.5 10.5 14.17 10.5 15V19.5C10.5 20.33 9.83 21 9 21H4.5C3.67 21 3 20.33 3 19.5V15ZM4.5 15V19.5H9V15H4.5ZM6 6H7.5V7.5H6V6ZM16.5 6H18V7.5H16.5V6ZM6 16.5H7.5V18H6V16.5ZM13.5 13.5H16.5V15H13.5V13.5ZM18 13.5H21V16.5H19.5V15H18V13.5ZM13.5 16.5H15V19.5H18V21H13.5V16.5ZM16.5 16.5H18V18H16.5V16.5ZM19.5 18H21V21H19.5V18Z"
        fill={fill}
      />
    </svg>
  );
};

export default QrCode;
