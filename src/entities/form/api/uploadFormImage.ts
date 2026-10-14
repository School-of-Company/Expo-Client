/**
 * 신청 폼 이미지(`IMAGE`) 업로드. 업로드된 이미지 URL을 돌려준다.
 * ponytail: 참가자용 업로드 API가 아직 없어 mock이다. 기존 `POST /image`는 관리자 토큰 전용이라 못 쓴다.
 * API가 나오면 이 함수 몸통만 바꾼다.
 */
export const uploadFormImage = async (file: File): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return `mock://form-image/${encodeURIComponent(file.name)}`;
};
