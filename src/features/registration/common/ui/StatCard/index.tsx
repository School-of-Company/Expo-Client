import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  sub?: ReactNode;
  /** 오른쪽 위에 붙는 표시(예시 데이터 배지 등) */
  badge?: ReactNode;
  /** 강조할 카드는 숫자를 main 색으로 */
  emphasis?: boolean;
}

/** 대시보드 상단 숫자 카드. 여러 개를 grid 로 나란히 둔다 */
const StatCard = ({
  label,
  value,
  unit,
  sub,
  badge,
  emphasis,
}: StatCardProps) => (
  <div className="flex min-w-0 flex-col gap-8 rounded-sm border-1 border-solid border-gray-200 px-24 py-20 mobile:px-16 mobile:py-16">
    <div className="flex items-start justify-between gap-8">
      <p className="text-caption1r text-gray-500">{label}</p>
      {badge}
    </div>
    <p className="flex items-baseline gap-4">
      <span className={`text-h2b ${emphasis ? 'text-main-600' : 'text-black'}`}>
        {value}
      </span>
      {unit && <span className="text-body2r text-gray-500">{unit}</span>}
    </p>
    {sub && <p className="text-caption1r text-gray-400">{sub}</p>}
  </div>
);

export default StatCard;
