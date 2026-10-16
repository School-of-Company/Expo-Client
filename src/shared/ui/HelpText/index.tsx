interface HelpTextProps {
  /** error 는 입력값을 고쳐야 할 때 쓴다 */
  tone?: 'default' | 'error';
  className?: string;
  children: React.ReactNode;
}

/** 입력·버튼 아래에 붙는 짧은 안내 문구 */
const HelpText = ({
  tone = 'default',
  className = '',
  children,
}: HelpTextProps) => (
  <p
    role={tone === 'error' ? 'alert' : undefined}
    className={`break-keep text-caption1r ${tone === 'error' ? 'text-error' : 'text-gray-500'} ${className}`}
  >
    {children}
  </p>
);

export default HelpText;
