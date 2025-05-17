type HandleDateChangeType = <T extends string>(
  setValue: (field: T, value: string) => void,
  field: T,
  date: Date | null,
) => void;

export const handleDateChange: HandleDateChangeType = (
  setValue,
  field,
  date,
) => {
  if (date) {
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(
      2,
      '0',
    )} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    setValue(field, formattedDate);
  }
};
