export const processSchoolLevel = (schoolLevel: unknown): string => {
  const schoolLevelMap: { [key: string]: string } = {
    유치원: 'KINDERGARTEN',
    초등학교: 'ELEMENTARY',
    중학교: 'MIDDLE',
    고등학교: 'HIGH',
  };

  if (Array.isArray(schoolLevel)) {
    return schoolLevel
      .map((level) => {
        if (level === 'etc') {
          return 'OTHER';
        }
        return schoolLevelMap[level] || level;
      })
      .join(', ');
  } else {
    if (schoolLevel === 'etc') {
      return 'OTHER';
    }
    return schoolLevelMap[schoolLevel as string] || String(schoolLevel);
  }
};
