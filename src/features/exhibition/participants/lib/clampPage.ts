/** 서버는 범위를 벗어난 page 에 빈 목록과 실제 totalPage 를 준다. 마지막 페이지로 보정한 값을 돌려준다 */
export const clampPage = (page: number, totalPage: number) =>
  Math.min(page, Math.max(totalPage, 1));
