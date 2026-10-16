interface SectionProps {
  title?: React.ReactNode;
  /** 제목 아래 한 줄 설명 */
  description?: React.ReactNode;
  /** 제목 오른쪽에 두는 보조 동작·기준 시각 */
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

/** 화면 안에서 내용을 묶는 테두리 카드 */
const Section = ({
  title,
  description,
  action,
  className = '',
  children,
}: SectionProps) => {
  const hasHeader = title || description || action;

  return (
    <section
      className={`space-y-16 rounded-sm border-1 border-solid border-gray-200 px-24 py-20 mobile:px-16 ${className}`}
    >
      {hasHeader && (
        <div className="flex items-start justify-between gap-12">
          <div className="min-w-0 space-y-4">
            {title && <h2 className="text-body1b text-black">{title}</h2>}
            {description && (
              <p className="break-keep text-caption1r text-gray-500">
                {description}
              </p>
            )}
          </div>
          {action && (
            <div className="flex shrink-0 items-center gap-12">{action}</div>
          )}
        </div>
      )}
      {children}
    </section>
  );
};

export default Section;
