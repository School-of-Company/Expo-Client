interface Props {
  categories: string[];
}

const TableHeader = ({ categories }: Props) => {
  return (
    <div className="flex items-center justify-between border-b-1 border-solid border-gray-100 py-26">
      {categories.map((category, index) => (
        <div key={index} className="flex-1">
          <p className="text-center text-caption1b text-gray-500">{category}</p>
        </div>
      ))}
    </div>
  );
};

export default TableHeader;
