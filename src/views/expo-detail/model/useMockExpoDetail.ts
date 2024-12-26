export const useMockExpoDetail = () => {
  const expoDetailMockData = {
    headerTitle: '2024 AI광주미래교육박람회',
    introduction: {
      content:
        '안녕하세요!\n 2024 AI광주미래교육박람회 사전 등록 페이지에 오신 것을 환영합니다.\n 아래 양식을 작성해주시면 등록이 완료됩니다.\n 많은 관심과 참여 부탁드립니다.',
    },
    training: {
      content:
        '- 내가 경험한 AI 광주미래교육\n- AI 팩토리 수업 시연\n- Google for Education',
    },
    location: {
      address: '주소: 광주광역시 광산구 상무대로 312',
      coordinates: {
        latitude: 35.1427689679488,
        longitude: 126.800771954215,
      },
    },
  };

  return { expoDetail: expoDetailMockData };
};
