// TODO: 연수 프로그램 질문을 표현할 dynamicFormType 이 백엔드에 추가되면
// 제목 문자열 대신 타입으로 판별하도록 교체 (#303)
const TRAINING_PROGRAM_QUESTION_KEYWORD = '연수 프로그램을 선택해';

export const isTrainingProgramQuestion = (title?: string): boolean =>
  !!title?.includes(TRAINING_PROGRAM_QUESTION_KEYWORD);

// 옵션 값 형식: "[HH:mm ~ HH:mm] 프로그램명"
export const formatTrainingProgramOption = (
  startTime: string,
  endTime: string,
  title: string,
): string => `[${startTime} ~ ${endTime}] ${title}`;

export const extractTrainingProgramTitle = (option: string): string =>
  option.replace(/^\[[\d:~\s]+\]\s*/, '').trim();
