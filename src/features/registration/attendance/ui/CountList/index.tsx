export interface CountItem {
  label: string;
  count: number;
}

/** 라벨과 건수를 한 줄씩 나열한다(입장 방식별·스캐너별) */
const CountList = ({
  items,
  emptyText,
}: {
  items: CountItem[];
  emptyText: string;
}) => (
  <ul className="rounded-sm border-1 border-solid border-gray-200 px-24 py-8 mobile:px-16">
    {items.length === 0 && (
      <li className="py-24 text-center text-body2r text-gray-400">
        {emptyText}
      </li>
    )}
    {items.map(({ label, count }) => (
      <li
        key={label}
        className="flex items-center justify-between gap-12 border-b-1 border-solid border-gray-100 py-12 last:border-b-0"
      >
        <p className="min-w-0 text-body2r text-gray-500">{label}</p>
        <p className="shrink-0 text-body2b text-black">
          {count.toLocaleString()}건
        </p>
      </li>
    ))}
  </ul>
);

export default CountList;
