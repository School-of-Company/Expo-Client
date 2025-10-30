export const formatKoreanDateRange = (
  startIso: string,
  endIso: string,
): string => {
  const start = new Date(startIso);
  const end = new Date(endIso);

  const month = start.getMonth() + 1;
  const day = start.getDate();
  const startHours = String(start.getHours()).padStart(2, '0');
  const startMinutes = String(start.getMinutes()).padStart(2, '0');
  const endHours = String(end.getHours()).padStart(2, '0');
  const endMinutes = String(end.getMinutes()).padStart(2, '0');

  return `${month}월 ${day}일 ${startHours}:${startMinutes} ~ ${endHours}:${endMinutes}`;
};
