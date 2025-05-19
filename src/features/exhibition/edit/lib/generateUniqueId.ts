let lastGeneratedId = 1000;

export const generateUniqueId = () => {
  lastGeneratedId += 1;
  return lastGeneratedId;
};
