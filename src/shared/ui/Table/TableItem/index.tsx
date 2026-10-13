interface TableItemProps<
  T extends { id: string | number } & Record<string, unknown>,
  K extends string | number = T['id'],
> {
  data: T;
  // 선택 상태와 비교하는 키. 기본은 data.id
  rowKey: K;
  state: K | null;
  setState: React.Dispatch<React.SetStateAction<K | null>>;
  selectItemBoolean: boolean;
  categories: string[];
}

const TableItem = <
  T extends { id: string | number } & Record<string, unknown>,
  K extends string | number = T['id'],
>({
  data,
  rowKey,
  state,
  setState,
  selectItemBoolean,
  categories,
}: TableItemProps<T, K>) => {
  const handleSelectItem = (key: K) => {
    if (!selectItemBoolean) return;
    setState((prev) => (prev === key ? null : key));
  };

  const isSelected = state === rowKey;
  type RenderValueType = boolean | string | number | object | unknown;

  const renderValue = (value: RenderValueType): string => {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'number') {
      return String(value);
    }
    if (typeof value === 'boolean') {
      return value ? 'O' : 'X';
    } else if (value === 'PRE') {
      return '사전 등록';
    } else if (value === 'FIELD') {
      return '현장 등록';
    } else if (value === 'STANDARD') {
      return '일반';
    } else if (value === 'TRAINEE') {
      return '연수자';
    }
    return typeof value === 'string' ? value : JSON.stringify(value);
  };

  const getFieldValue = (category: string): RenderValueType => {
    switch (category) {
      case '번호':
      case '아이디':
        return data.id;
      case '이름':
      case '성명':
        return data['name' as keyof T];
      case '연수번호':
        return data['trainingId' as keyof T];
      case '연락처':
        return data['phoneNumber' as keyof T];
      // 관리자 가입 요청: 로그인에 쓰는 아이디는 서버 nickname 이다
      case '로그인 아이디':
        return data['nickname' as keyof T];
      case '이메일':
        return data['email' as keyof T];
      case '등록 유형':
        return data['applicationType' as keyof T];
      case '개인정보 동의':
        return data['informationStatus' as keyof T];
      case '개인정보 상태':
        return data['personalInformationStatus' as keyof T];
      case '참가자 상태':
        return data['participationType' as keyof T];
      case '명찰 출력':
        return data['badge' as keyof T] != null;
      case '박람회이름':
        return data['title' as keyof T];
      case '박람회 설명':
        return data['description' as keyof T];
      case '모집 시작 날짜':
        return data['startedDay' as keyof T];
      case '모집 종료 날짜':
        return data['finishedDay' as keyof T];
      case '프로그램':
      case '프로그램 이름':
        return data['programName' as keyof T] || data['title' as keyof T];
      case '시작시간':
        return data['startedAt' as keyof T];
      case '종료시간':
        return data['endedAt' as keyof T];
      case '상태':
        return data['category' as keyof T];
      case '출석 여부':
        return data['status' as keyof T];
      case '입실 시간':
        return data['entryTime' as keyof T];
      case '퇴실 시간':
        return data['leaveTime' as keyof T];
      default:
        return '';
    }
  };

  return (
    <button
      type="button"
      onClick={() => handleSelectItem(rowKey)}
      className={`flex w-full items-center justify-between rounded-sm border-1 border-solid border-gray-200 py-8 ${
        isSelected ? 'bg-main-100' : 'bg-white'
      }`}
    >
      {categories.map((category, index) => (
        <div
          key={index}
          className="flex-1 overflow-hidden text-center text-body2r text-gray-500"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis',
          }}
        >
          {renderValue(getFieldValue(category))}
        </div>
      ))}
    </button>
  );
};

export default TableItem;
