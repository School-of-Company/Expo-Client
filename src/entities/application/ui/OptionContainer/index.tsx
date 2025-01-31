import CheckBoxOption from '../CheckBoxOption';
import MultipleOption from '../MultipleOption';
import SentenceOption from '../SentenceOption';

const OptionContainer = ({
  title,
  formType,
  jsonData,
}: {
  title: string;
  formType: string;
  jsonData: string;
}) => {
  let inputComponent;

  const options = jsonData
    ? Object.entries(JSON.parse(jsonData)).map(([key, value]) => ({
        value: key,
        label: value as string,
      }))
    : [];

  switch (formType) {
    case 'SENTENCE':
      inputComponent = (
        <SentenceOption
          placeholder={title}
          maxLength={1000}
          row={1}
          required={false}
        />
      );
      break;
    case 'CHECKBOX':
      inputComponent = <CheckBoxOption options={options} name={title} />;
      break;
    case 'MULTIPLE':
      inputComponent = <MultipleOption options={options} name={title} />;
      break;
    case 'DROPDOWN':
      inputComponent = (
        <select className="rounded border px-2 py-1">
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
      break;
  }

  return (
    <div className="flex flex-col gap-[20px] rounded-sm border-1 border-solid border-gray-200 p-[18px]">
      <p className="text-h4 text-black">{title}</p>
      <div className="space-y-2">{inputComponent}</div>
    </div>
  );
};

export default OptionContainer;
