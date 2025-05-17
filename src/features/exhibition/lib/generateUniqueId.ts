let lastGeneratedId = 1000; // 초기값 설정

export const generateUniqueId = () => {
  lastGeneratedId += 1;
  return lastGeneratedId;
};
