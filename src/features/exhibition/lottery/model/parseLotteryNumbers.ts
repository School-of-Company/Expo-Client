export const MAX_LOTTERY_NUMBERS = 100;

type ParseResult =
  | { numbers: number[]; error?: undefined }
  | { numbers?: undefined; error: string };

/** 쉼표·공백·줄바꿈으로 구분한 당첨 번호를 서버 규칙(1 이상의 정수, 중복 없음, 최대 100개)으로 검사한다. */
export const parseLotteryNumbers = (input: string): ParseResult => {
  const tokens = input.split(/[\s,]+/).filter(Boolean);
  const invalid = tokens.find((token) => !/^[1-9]\d*$/.test(token));
  if (invalid) {
    return { error: `'${invalid}'은(는) 1 이상의 정수가 아닙니다.` };
  }

  const numbers = tokens.map(Number);
  const duplicated = numbers.find(
    (number, index) => numbers.indexOf(number) !== index,
  );
  if (duplicated !== undefined) {
    return { error: `${duplicated}이(가) 중복되었습니다.` };
  }
  if (numbers.length > MAX_LOTTERY_NUMBERS) {
    return {
      error: `당첨 번호는 최대 ${MAX_LOTTERY_NUMBERS}개까지 입력할 수 있습니다.`,
    };
  }

  return { numbers: numbers.sort((a, b) => a - b) };
};
