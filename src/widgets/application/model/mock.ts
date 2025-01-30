import { MockData } from '@/shared/types/application/type';

export const mockData: MockData = {
  informationImage: 'https://example.com/image.png',
  participantType: 'TRAINEE', // or "STANDARD"
  dynamicForm: [
    {
      title: '학교급을 선택해주세요',
      jsonData: '{"1": "초등학교", "2": "중학교", "3": "고등학교"}',
      formType: 'RADIO',
    },
    {
      title: '좋아하는 요리',
      jsonData: '{"1": "일식", "2": "중식"}',
      formType: 'CHECKBOX',
    },
  ],
};
