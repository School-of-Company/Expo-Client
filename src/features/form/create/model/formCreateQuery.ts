/**
 * 폼 만들기 선택 화면(`/admin/form/new/[expoId]`)과 폼 작성 화면(`/admin/form/create/[expoId]`)이 함께 쓰는 주소 값.
 * 두 화면이 같은 쿼리 이름을 써서, 작성 화면 주소가 깨지면 그 쿼리를 그대로 선택 화면에 넘겨 고친다
 */

export type FormCreateMode = 'application' | 'survey' | 'program';
export type FormCreateUserType = 'STANDARD' | 'TRAINEE';
export type FormCreateApplicationType = 'PRE' | 'FIELD';

export interface FormCreateSelection {
  mode: FormCreateMode | null;
  userType: FormCreateUserType | null;
  applicationType: FormCreateApplicationType | null;
  /** ISO 문자열. 등록용 폼만 쓴다 */
  startDate: string | null;
  endDate: string | null;
}

/** 작성 화면까지 가는 데 필요한 값이 다 있는 선택 */
export type CompleteFormSelection =
  | {
      mode: 'application';
      userType: FormCreateUserType;
      applicationType: FormCreateApplicationType;
      startDate: string;
      endDate: string;
    }
  | {
      mode: 'survey';
      userType: FormCreateUserType;
      applicationType: 'PRE';
      startDate: null;
      endDate: null;
    };

export const FORM_CREATE_QUERY = {
  mode: 'mode',
  userType: 'type',
  applicationType: 'applicationType',
  startDate: 'startDate',
  endDate: 'endDate',
  returnTo: 'returnTo',
} as const;

const MODES: readonly FormCreateMode[] = ['application', 'survey', 'program'];
const USER_TYPES: readonly FormCreateUserType[] = ['STANDARD', 'TRAINEE'];
const APPLICATION_TYPES: readonly FormCreateApplicationType[] = [
  'PRE',
  'FIELD',
];

const pick = <T extends string>(
  value: string | null,
  allowed: readonly T[],
): T | null => (allowed.includes(value as T) ? (value as T) : null);

const toIsoDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

type QueryReader = { get: (key: string) => string | null };

/** 주소의 값 중 쓸 수 있는 것만 남긴다. 모르는 값은 고르지 않은 것으로 본다 */
export const parseFormCreateSelection = (
  query: QueryReader,
): FormCreateSelection => ({
  mode: pick(query.get(FORM_CREATE_QUERY.mode), MODES),
  userType: pick(query.get(FORM_CREATE_QUERY.userType), USER_TYPES),
  applicationType: pick(
    query.get(FORM_CREATE_QUERY.applicationType)?.toUpperCase() ?? null,
    APPLICATION_TYPES,
  ),
  startDate: toIsoDate(query.get(FORM_CREATE_QUERY.startDate)),
  endDate: toIsoDate(query.get(FORM_CREATE_QUERY.endDate)),
});

/** 등록용 폼 신청 기간의 문제. 없으면 null */
export const getPeriodError = ({
  startDate,
  endDate,
}: Pick<FormCreateSelection, 'startDate' | 'endDate'>) => {
  if (!startDate || !endDate) return '신청 시작·마감 일시를 모두 골라 주세요.';
  if (new Date(startDate) >= new Date(endDate))
    return '마감 일시는 시작 일시보다 늦어야 합니다.';
  return null;
};

/** 작성 화면으로 넘길 수 있으면 그 값을, 아직 덜 골랐으면 null. 프로그램 폼은 다른 화면이라 null 이다 */
export const toCompleteSelection = (
  selection: FormCreateSelection,
): CompleteFormSelection | null => {
  const { mode, userType, applicationType, startDate, endDate } = selection;
  if (!userType) return null;
  // 만족도 조사는 등록 유형·신청 기간이 없다. 서버에는 사전등록으로 보낸다
  if (mode === 'survey')
    return {
      mode,
      userType,
      applicationType: 'PRE',
      startDate: null,
      endDate: null,
    };
  if (mode !== 'application' || !applicationType) return null;
  if (!startDate || !endDate || getPeriodError(selection)) return null;
  return { mode, userType, applicationType, startDate, endDate };
};

/** 선택 화면 주소의 쿼리. 고른 것만 남겨 뒤로 와도 그대로 보이게 한다 */
export const toSelectionQuery = (
  selection: FormCreateSelection,
  returnTo?: string | null,
) => {
  const query = new URLSearchParams();
  const set = (key: string, value: string | null) => {
    if (value) query.set(key, value);
  };
  set(FORM_CREATE_QUERY.mode, selection.mode);
  // 프로그램 폼은 대상·기간을 만들기 화면에서 정한다
  if (selection.mode !== 'program') {
    set(FORM_CREATE_QUERY.userType, selection.userType);
  }
  if (selection.mode === 'application') {
    set(FORM_CREATE_QUERY.applicationType, selection.applicationType);
    set(FORM_CREATE_QUERY.startDate, selection.startDate);
    set(FORM_CREATE_QUERY.endDate, selection.endDate);
  }
  set(FORM_CREATE_QUERY.returnTo, returnTo ?? null);
  return query.toString();
};

const segment = (expoId: string) => encodeURIComponent(expoId);

/** 폼 작성 화면 주소. 저장 뒤 돌아갈 곳(returnTo)도 그대로 넘긴다 */
export const getFormCreatePath = (
  expoId: string,
  selection: CompleteFormSelection,
  returnTo?: string | null,
) => {
  const query = new URLSearchParams({
    [FORM_CREATE_QUERY.userType]: selection.userType,
    [FORM_CREATE_QUERY.mode]: selection.mode,
    [FORM_CREATE_QUERY.applicationType]: selection.applicationType,
  });
  if (selection.startDate && selection.endDate) {
    query.set(FORM_CREATE_QUERY.startDate, selection.startDate);
    query.set(FORM_CREATE_QUERY.endDate, selection.endDate);
  }
  if (returnTo) query.set(FORM_CREATE_QUERY.returnTo, returnTo);
  return `/admin/form/create/${segment(expoId)}?${query}`;
};
