export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-') // 공백 → 하이픈
    .replace(/[^\wㄱ-ㅎㅏ-ㅣ가-힣-]/g, '') // 특수문자 제거 (한글 제외)
    .replace(/--+/g, '-') // 중복 하이픈 제거
    .replace(/^-+|-+$/g, ''); // 앞뒤 하이픈 제거
};
