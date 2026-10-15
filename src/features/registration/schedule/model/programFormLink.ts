import { ScheduleProgram, toOffsetDateTime } from '../../common';
import { ProgramSessionType } from '../../common/api/ledgerApi';
import { PolicyForm, ProgramForm } from './policyForm';
import type {
  FormParticipantType,
  ProgramFormResponseDto,
} from '@/entities/form';

/** 연수·일반 프로그램 ID 는 서로 겹칠 수 있어 구분을 붙여 키로 쓴다 */
export const toProgramKey = ({
  programType,
  id,
}: Pick<ScheduleProgram, 'programType' | 'id'>) => `${programType}-${id}`;

/** 서버가 회차 구분과 폼 대상을 맞춰 본다(Expo-Expo-Server ProgramPolicyClient) */
export const FORM_PARTICIPANT_TYPE: Record<
  ProgramSessionType,
  FormParticipantType
> = {
  STANDARD: 'STANDARD',
  TRAINING: 'TRAINEE',
};

export const FORM_PARTICIPANT_LABEL: Record<FormParticipantType, string> = {
  STANDARD: '일반 참가자',
  TRAINEE: '교원 연수자',
};

/** 이 행사 회차가 쓰는 폼 ID. 행사별 폼 목록 API 가 생기기 전까지 고를 수 있는 폼의 출처다 */
export const getLinkedFormIds = (programs: ScheduleProgram[]) =>
  Array.from(
    new Set(
      programs.flatMap(({ policy }) => (policy?.formId ? [policy.formId] : [])),
    ),
  );

/** 이 폼을 쓰는 회차. 폼을 고치면 이 회차들이 모두 영향을 받는다 */
export const getProgramsUsingForm = (
  programs: ScheduleProgram[],
  formId: string,
) => programs.filter(({ policy }) => policy?.formId === formId);

export interface ProgramGroup {
  groupId: string;
  programs: ScheduleProgram[];
}

/** 같은 groupId 를 쓰는 회차를 묶는다. 묶음은 따로 저장되지 않고 회차의 groupId 로만 존재한다 */
export const getProgramGroups = (
  programs: ScheduleProgram[],
): ProgramGroup[] => {
  const groups = new Map<string, ScheduleProgram[]>();
  programs.forEach((program) => {
    const groupId = program.policy?.groupId ?? program.groupId;
    if (!groupId) return;
    groups.set(groupId, [...(groups.get(groupId) ?? []), program]);
  });
  return Array.from(groups, ([groupId, members]) => ({
    groupId,
    programs: members,
  }));
};

const sameId = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/**
 * 서버가 회차 저장 때 거절할 폼 연결을 미리 알려 준다. 문제가 없으면 null.
 * 다른 행사·등록용 폼, 대상 불일치, 폼 응답 기간이 모집 기간을 덮지 못하는 경우다
 */
export const getFormLinkProblem = (
  form: ProgramFormResponseDto,
  expoId: string,
  programType: ProgramSessionType,
  policy: Pick<PolicyForm, 'applicationStartedAt' | 'applicationEndedAt'>,
): string | null => {
  if (!sameId(form.expoId, expoId))
    return '다른 행사의 폼은 연결할 수 없습니다.';
  if (form.purpose !== 'PROGRAM') return '프로그램용 폼만 연결할 수 있습니다.';
  if (
    form.participantType &&
    form.participantType !== FORM_PARTICIPANT_TYPE[programType]
  )
    return `${FORM_PARTICIPANT_LABEL[form.participantType]} 대상 폼은 이 회차 구분에 연결할 수 없습니다.`;
  const startedAt = toOffsetDateTime(policy.applicationStartedAt);
  const endedAt = toOffsetDateTime(policy.applicationEndedAt);
  if (
    (startedAt && Date.parse(form.startDate) > Date.parse(startedAt)) ||
    (endedAt && Date.parse(form.endDate) < Date.parse(endedAt))
  )
    return '폼 응답 기간이 모집 기간을 포함해야 합니다. 폼 편집에서 응답 기간을 늘려주세요.';
  return null;
};

/** 폼을 만들러 갔다 돌아올 때 이어서 편집할 회차 초안 */
export interface ProgramDraft {
  /** 'new' 면 새 회차, 아니면 toProgramKey */
  target: string;
  form: ProgramForm;
}

/** 폼 생성 화면이 저장 후 돌아올 때 붙이는 쿼리 */
export const DRAFT_QUERY = {
  returnTo: 'returnTo',
  resume: 'resumeDraft',
  formId: 'linkFormId',
} as const;

const draftKey = (expoId: string) => `programDraft:${expoId}`;

// 사생활 보호 모드 등에서 sessionStorage 접근이 막혀도 화면은 계속 쓸 수 있게 한다
export const saveProgramDraft = (expoId: string, draft: ProgramDraft) => {
  try {
    sessionStorage.setItem(draftKey(expoId), JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
};

export const readProgramDraft = (expoId: string): ProgramDraft | null => {
  try {
    const raw = sessionStorage.getItem(draftKey(expoId));
    return raw ? (JSON.parse(raw) as ProgramDraft) : null;
  } catch {
    return null;
  }
};

export const clearProgramDraft = (expoId: string) => {
  try {
    sessionStorage.removeItem(draftKey(expoId));
  } catch {
    // 지우지 못해도 다음 저장이 덮어쓴다
  }
};

/** 회차에서 폼을 만들러 갈 때 폼 대상·응답 기간을 회차 구분·모집 기간에 맞춰 채운다 */
export const getDraftFormDefaults = ({ form }: ProgramDraft) => ({
  participantType: FORM_PARTICIPANT_TYPE[form.programType],
  startDate: form.policy.applicationStartedAt ?? '',
  endDate: form.policy.applicationEndedAt ?? '',
});
