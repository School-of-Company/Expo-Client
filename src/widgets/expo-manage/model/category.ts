export const baseCategories = [
  '번호',
  '이름',
  '안내문자 발송용 연락처',
  '소속',
  '직급',
  '개인정보동의제공 동의',
];

export const selectOptionCategories = [
  { value: 'trainee', label: '사전 교원연수참가자' },
  { value: 'FIELD', label: '현장신청자' },
  { value: 'PRE', label: '사전 행사참가자' },
];

export const category = (selectOption: string) => {
  return selectOption === 'trainee'
    ? ['연수원 아이디', '노트북 지참 여부', '학교급', '상태', ...baseCategories]
    : baseCategories;
};
