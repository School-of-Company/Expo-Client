// 서버는 ISO 지역 일시(초 포함 가능)로 주고, 수정 요청은 'yyyy-MM-dd HH:mm'만 받으므로 분까지 자른다
export const formatDateTime = (dateTimeString: string | null | undefined) => {
  if (!dateTimeString) return '';
  return dateTimeString.slice(0, 16).replace('T', ' ');
};

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}
