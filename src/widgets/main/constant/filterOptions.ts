export const filterOptions = [
  {
    name: '참가자',
    options: [
      {
        value: 'standardFormCreatedStatus',
        label: '참가자 폼 (O)',
        status: true,
      },
      {
        value: 'standardFormCreatedStatus',
        label: '참가자 폼 (X)',
        status: false,
      },
      {
        value: 'standardSurveyCreatedStatus',
        label: '참가자 만족도 폼 (O)',
        status: true,
      },
      {
        value: 'standardSurveyCreatedStatus',
        label: '참가자 만족도 폼 (X)',
        status: false,
      },
    ],
  },
  {
    name: '연수자',
    options: [
      {
        value: 'traineeFormCreatedStatus',
        label: '연수자 폼 (O)',
        status: true,
      },
      {
        value: 'traineeFormCreatedStatus',
        label: '연수자 폼 (X)',
        status: false,
      },
      {
        value: 'traineeSurveyCreatedStatus',
        label: '연수자 만족도 폼 (O)',
        status: true,
      },
      {
        value: 'traineeSurveyCreatedStatus',
        label: '연수자 만족도 폼 (X)',
        status: false,
      },
    ],
  },
];
