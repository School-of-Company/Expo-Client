export const formatDateTime = (dateTimeString: string) => {
  return dateTimeString.replace('T', ' ');
};

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}
