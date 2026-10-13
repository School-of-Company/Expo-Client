/**
 * 폼에서 고른 연수 프로그램 제목을 현재 프로그램 ID로 바꾼다.
 * 기존 연수 신청은 선택한 프로그램 전체를 한 번에 교체하므로, 하나라도 못 찾으면
 * 일부만 보내지 않고 제출을 막는다. 고른 게 없으면 신청 자체가 성립하지 않는다.
 */
export const resolveTrainingProgramIds = (
  selectedTitles: string[],
  programs: { id: number; title: string }[],
): number[] => {
  if (selectedTitles.length === 0) {
    throw new Error('연수 프로그램을 1개 이상 선택해주세요.');
  }

  const ids = selectedTitles.map(
    (title) => programs.find((program) => program.title === title)?.id,
  );
  if (ids.some((id) => id === undefined)) {
    throw new Error(
      '선택한 연수 프로그램 정보가 바뀌었습니다. 새로고침 후 다시 선택해주세요.',
    );
  }

  return Array.from(new Set(ids as number[]));
};
