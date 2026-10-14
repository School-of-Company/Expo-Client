const STORAGE_KEY = 'applicationVisitor';

// 서버가 UV 를 Asia/Seoul 날짜별로 세므로 날짜도 같은 기준으로 잡는다
const getKstDate = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(
    new Date(),
  );

/**
 * 하루 동안만 쓰는 무작위 방문자 ID. 날짜가 바뀌면 새로 만든다.
 * 저장소를 쓸 수 없으면 이번 진입에만 쓰는 ID 를 돌려준다
 */
export const getVisitorId = () => {
  const date = getKstDate();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (saved?.date === date && typeof saved.id === 'string') return saved.id;
  } catch {
    // 깨진 값은 새 ID 로 덮어쓴다
  }
  const id = crypto.randomUUID();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date, id }));
  } catch {
    // 저장하지 못해도 기록은 보낸다
  }
  return id;
};
