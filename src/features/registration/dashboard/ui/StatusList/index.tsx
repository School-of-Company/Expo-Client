export interface StatusItem {
  label: string;
  value: string;
  sub?: string;
}

/** AdminProfile 처럼 라벨과 값을 나열한다 */
const StatusList = ({ items }: { items: StatusItem[] }) => {
  return (
    <div className="grid grid-cols-2 gap-x-[80px] gap-y-[24px] rounded-sm border-1 border-solid border-gray-200 px-30 py-[28px] mobile:grid-cols-1 mobile:px-16">
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline gap-16">
          <p className="w-[100px] flex-none text-body1r text-gray-500">
            {item.label}
          </p>
          <p className="text-h3b text-black">{item.value}</p>
          {item.sub && <p className="text-body2r text-gray-400">{item.sub}</p>}
        </div>
      ))}
    </div>
  );
};

export default StatusList;
