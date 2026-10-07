// TODO(dev-mock): 서버 복구 후 이 파일과 호출부(getApplicationForm, getSurveyForm) 제거
// expoId 가 'mock' 이면 서버 대신 이 데이터를 돌려준다
import { ApplicationForm } from '../types/application/type';
import { ApplicationType } from '../types/exhibition/type';

const DAY = 24 * 60 * 60 * 1000;

// [시작, 종료] 오늘 기준 일수. null 이면 없는 폼
const PERIODS: Record<string, [number, number] | null> = {
  'application-STANDARD-PRE': [-3, 7], // 접수중
  'application-TRAINEE-PRE': [-10, -1], // 접수 마감
  'application-STANDARD-FIELD': [2, 5], // 접수 예정
  'application-TRAINEE-FIELD': null,
  'survey-STANDARD-PRE': [-1, 30],
  'survey-TRAINEE-PRE': [5, 10],
};

const option = (labels: string[]) =>
  Object.fromEntries(labels.map((label, index) => [String(index + 1), label]));

const FIELDS: ApplicationForm['dynamicForm'] = [
  {
    id: 1,
    title: '대표자 거주 지역',
    formType: 'DROPDOWN',
    jsonData: option(['광주', '전남', '전북', '기타']),
    requiredStatus: true,
    otherJson: null,
  },
  {
    id: 2,
    title: '참여 시간',
    formType: 'MULTIPLE',
    jsonData: option([
      '10.31(토) 오전',
      '10.31(토) 오후',
      '11.1(일) 오전',
      '11.1(일) 오후',
    ]),
    requiredStatus: true,
    otherJson: null,
  },
  {
    id: 3,
    title: '이름',
    formType: 'SENTENCE',
    jsonData: {},
    requiredStatus: true,
    otherJson: null,
  },
];

export const getMockForm = (
  formType: 'application' | 'survey',
  userType: string,
  applicationType: ApplicationType,
): ApplicationForm => {
  const period = PERIODS[`${formType}-${userType}-${applicationType}`];
  if (!period) throw new Error('mock: 폼 없음');

  const now = Date.now();
  return {
    title: `${userType === 'TRAINEE' ? '교원연수' : '일반'} 신청서`,
    informationText: '목 데이터 안내 문구입니다. 실제 서버 응답이 아닙니다.',
    startDate: new Date(now + period[0] * DAY).toISOString(),
    endDate: new Date(now + period[1] * DAY).toISOString(),
    participantType: userType as ApplicationForm['participantType'],
    [formType === 'survey' ? 'dynamicSurveyResponseDto' : 'dynamicForm']:
      FIELDS,
  };
};
