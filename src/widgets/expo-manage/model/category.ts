export const selectOptionCategories = [
  { value: 'trainee', label: '사전 교원연수참가자' },
  { value: 'FIELD', label: '현장신청자' },
  { value: 'PRE', label: '사전 행사참가자' },
];

export const category = (selectOption: string) => {
  const fields = ['번호', '이름', '연락처'];

  if (selectOption === 'trainee') {
    fields.splice(2, 0, '연수번호');
    fields.push('신청 유형');
  } else {
    fields.push('개인정보 동의');
  }

  return fields;
};
