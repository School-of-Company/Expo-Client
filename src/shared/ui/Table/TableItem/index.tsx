interface TableItemProps<T extends Record<string, unknown>> {
  data: T;
}

const TableItem = <T extends Record<string, unknown>>({
  data,
}: TableItemProps<T>) => {
  return (
    <div className="mr-5 flex items-center justify-between rounded-sm border-1 border-solid border-gray-200 px-4 py-2">
      {Object.entries(data).map(([key, value]) => (
        <div
          key={key}
          className="flex-1 overflow-hidden text-center text-caption1 text-gray-500"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis',
          }}
        >
          {typeof value === 'string' ? value : JSON.stringify(value)}
        </div>
      ))}
    </div>
  );
};

export default TableItem;
