interface TableItemProps<T extends { id: number } & Record<string, unknown>> {
  data: T;
  state: number | null;
  setState: React.Dispatch<React.SetStateAction<number | null>>;
  selectItemBoolean: boolean;
  categories: string[];
}

const TableItem = <T extends { id: number } & Record<string, unknown>>({
  data,
  state,
  setState,
  selectItemBoolean,
  categories,
}: TableItemProps<T>) => {
  const handleSelectItem = (id: number) => {
    if (!selectItemBoolean) return;
    setState((prev) => (prev === id ? null : id));
  };

  const isSelected = state === data.id;
  type RenderValueType = boolean | string | number | object | unknown;

  const renderValue = (value: RenderValueType): string => {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'number') {
      return String(value);
    }
    if (typeof value === 'boolean') {
      return value ? 'O' : 'X';
    } else if (value === 'PRE') {
      return '사전 등록';
    } else if (value === 'FIELD') {
      return '현장 등록';
    }
    return typeof value === 'string' ? value : JSON.stringify(value);
  };

  const getFieldValue = (category: string): RenderValueType => {
    switch (category) {
      case '번호':
        return data.id;
      case '이름':
        return data['name' as keyof T];
      case '연수번호':
        return data['trainingId' as keyof T];
      case '연락처':
        return data['phoneNumber' as keyof T];
      case '등록 유형':
        return data['applicationType' as keyof T];
      case '개인정보 동의':
        return data['informationStatus' as keyof T];
      default:
        return '';
    }
  };

  return (
    <button
      type="button"
      onClick={() => handleSelectItem(data.id)}
      className={`flex w-full items-center justify-between rounded-sm border-1 border-solid border-gray-200 py-8 ${
        isSelected ? 'bg-main-100' : 'bg-white'
      }`}
    >
      {categories.map((category, index) => (
        <div
          key={index}
          className="flex-1 overflow-hidden text-center text-body2r text-gray-500"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis',
          }}
        >
          {renderValue(getFieldValue(category))}
        </div>
      ))}
    </button>
  );
};

export default TableItem;
