export const selectOptionCategories = [
  { value: 'STANDARD', label: '참가자' },
  { value: 'TRAINEE', label: '연수자' },
];

export const category = (selectOption: string) => {
  const fields = ['번호', '이름', '연락처'];

  if (selectOption === 'trainee') {
    fields.splice(2, 0, '연수번호');
    fields.push('등록 유형');
  } else {
    fields.push('개인정보 동의');
  }

  return fields;
};
