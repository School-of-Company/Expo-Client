const formTitles = {
  STANDARD: {
    application: '참가자 신청 폼',
    survey: '참가자 만족도 조사 폼',
  },
  TRAINEE: {
    application: '연수자 신청 폼',
    survey: '연수자 만족도 조사 폼',
  },
};

export const getFormTitle = (
  type: 'STANDARD' | 'TRAINEE',
  mode: 'application' | 'survey',
) => {
  return formTitles[type]?.[mode] || '폼';
};
