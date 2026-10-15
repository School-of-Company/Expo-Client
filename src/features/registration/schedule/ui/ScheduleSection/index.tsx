interface ScheduleSectionProps {
  title: string;
  description?: string;
  /** 제목 옆에 붙는 표시. 예시 데이터 배지 등 */
  badge?: React.ReactNode;
  /** aside 는 왼쪽 메뉴에 들어가는 작은 상자 모양이다 */
  variant?: 'page' | 'aside';
  children: React.ReactNode;
}

export const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-body2b text-black">{children}</p>
);

const ScheduleSection = ({
  title,
  description,
  badge,
  variant = 'page',
  children,
}: ScheduleSectionProps) => {
  const isAside = variant === 'aside';
  return (
    <section
      className={
        isAside
          ? 'space-y-16 rounded-sm border-1 border-solid border-gray-200 bg-white px-20 py-20'
          : 'space-y-[26px]'
      }
    >
      <div className="space-y-8">
        <div className="flex flex-wrap items-center gap-8">
          <p className={`text-black ${isAside ? 'text-h3b' : 'text-h2b'}`}>
            {title}
          </p>
          {badge}
        </div>
        {description && (
          <p
            className={`text-gray-500 ${isAside ? 'text-caption1r' : 'text-body2r'}`}
          >
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
};

export default ScheduleSection;
