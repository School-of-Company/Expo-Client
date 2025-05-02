interface TableItemProps<T extends { id: number } & Record<string, unknown>> {
  data: T;
  state: number | null;
  setState: React.Dispatch<React.SetStateAction<number | null>>;
  selectItemBoolean: boolean;
}

const TableItem = <T extends { id: number } & Record<string, unknown>>({
  data,
  state,
  setState,
  selectItemBoolean,
}: TableItemProps<T>) => {
  const handleSelectItem = (id: number) => {
    if (!selectItemBoolean) return;
    setState((prev) => (prev === id ? null : id));
  };

  const isSelected = state === data.id;
  type RenderValueType = boolean | string | object | unknown;

  const renderValue = (value: RenderValueType): string => {
    if (typeof value === 'boolean') {
      return value ? 'O' : 'X';
    } else if (value === 'PRE') {
      return '사전 등록';
    } else if (value === 'FIELD') {
      return '현장 등록';
    }
    return typeof value === 'string' ? value : JSON.stringify(value);
  };

  return (
    <button
      type="button"
      onClick={() => handleSelectItem(data.id)}
      className={`flex w-full items-center justify-between rounded-sm border-1 border-solid border-gray-200 py-8 ${
        isSelected ? 'bg-main-100' : 'bg-white'
      }`}
    >
      {Object.entries(data).map(([key, value]) => (
        <div
          key={key}
          className="flex-1 overflow-hidden text-center text-body2r text-gray-500"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis',
          }}
        >
          {renderValue(value)}
        </div>
      ))}
    </button>
  );
};

export default TableItem;
