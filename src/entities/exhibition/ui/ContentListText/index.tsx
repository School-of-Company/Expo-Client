interface ExpoStandard {
  title: string;
  startedAt: string;
  endedAt: string;
}

interface Props {
  data: ExpoStandard[];
  title: string;
}

const ContentListText = ({ data, title }: Props) => {
  const validData = data || [];

  return (
    <div className="space-y-4">
      <p className="text-body2r text-gray-400">{title}</p>
      {validData.map((item, index) => (
        <p className="text-body2r text-gray-400" key={index}>
          · {item.title}
        </p>
      ))}
    </div>
  );
};

export default ContentListText;
