import { createProgramForm } from '@/entities/form/api/programForms';
import {
  getSchedulePrograms,
  patchScheduleProgram,
  ScheduleProgram,
  toOffsetDateTime,
  toProgramDateTime,
} from '@/features/registration/common';
import {
  EMPTY_POLICY_FORM,
  getPolicyProblem,
  PolicyForm,
  toProgramPolicy,
} from '@/features/registration/schedule/model/policyForm';
import { FORM_PARTICIPANT_TYPE } from '@/features/registration/schedule/model/programFormLink';
import type { AdminOccupation } from '@/features/registration/common/api/ledgerApi';
import type {
  ExhibitionFormData,
  ProgramPolicyDraft,
} from '@/shared/types/exhibition/type';

type ProgramType = ScheduleProgram['programType'];

export const EMPTY_PROGRAM_POLICY_DRAFT: ProgramPolicyDraft = {
  applicationStartedAt: null,
  applicationEndedAt: null,
  cancelEndedAt: null,
  promotionEndedAt: null,
  preRegistrationCapacity: 1,
  waitingCapacity: 0,
  allowedOccupations: [],
};

const PROGRAM_FORM_TITLE: Record<ProgramType, string> = {
  STANDARD: '프로그램 신청 폼',
  TRAINING: '연수 신청 폼',
};

const toPolicyForm = (draft: ProgramPolicyDraft, formId = ''): PolicyForm => ({
  ...EMPTY_POLICY_FORM,
  ...draft,
  allowedOccupations: draft.allowedOccupations as AdminOccupation[],
  formId,
});

/** 회차 모달에서 저장 전에 서버가 거절할 정책을 막는다. 폼은 아직 없으므로 폼 연결은 보지 않는다 */
export const getPolicyDraftProblem = (
  draft: ProgramPolicyDraft,
): string | null => {
  if (
    !draft.applicationStartedAt ||
    !draft.applicationEndedAt ||
    !draft.cancelEndedAt ||
    !draft.promotionEndedAt
  )
    return '모집 시작·종료, 취소 마감, 대기 승급 마감을 모두 입력해주세요.';
  if (!Number.isInteger(draft.waitingCapacity) || draft.waitingCapacity < 0)
    return '대기 정원을 확인해주세요.';
  return getPolicyProblem(toProgramPolicy(toPolicyForm(draft)));
};

/** 구분별 회차 목록. 온라인 신청을 받는 회차만 */
const getPolicyTargets = (data: ExhibitionFormData) =>
  [
    ...data.standard.map((item) => ({
      programType: 'STANDARD' as const,
      item,
    })),
    ...data.trainings.map((item) => ({
      programType: 'TRAINING' as const,
      item,
    })),
  ].flatMap(({ programType, item }) =>
    item.policy ? [{ programType, item, policy: item.policy }] : [],
  );

/** 온라인 신청을 받는 회차가 있는 구분. 이 구분만 신청 폼을 만든다 */
export const getPolicyProgramTypes = (
  data: Pick<ExhibitionFormData, 'standard' | 'trainings'>,
): ProgramType[] =>
  (['STANDARD', 'TRAINING'] as const).filter((programType) =>
    (programType === 'STANDARD' ? data.standard : data.trainings).some(
      (item) => item.policy,
    ),
  );

const sessionKey = (
  programType: ProgramType,
  title: string,
  startedAt: string,
) => `${programType}|${title}|${startedAt.replace(' ', 'T').slice(0, 16)}`;

/**
 * 박람회를 만든 뒤 구분별 신청 폼을 만들고 회차마다 모집 정책을 붙인다.
 * 박람회 생성 API 는 정책을 받지 않고, 정책은 이 행사의 폼을 가리켜야 해서 박람회가 생긴 뒤에만 저장할 수 있다.
 * 폼 응답 기간은 그 구분 회차들의 모집 기간을 모두 덮게 정한다(서버가 덮지 못하는 연결을 거절한다)
 */
export const applyProgramPolicies = async (
  expoId: string,
  data: ExhibitionFormData,
) => {
  const targets = getPolicyTargets(data);
  if (targets.length === 0) return;

  const formIds = {} as Record<ProgramType, string>;
  for (const programType of getPolicyProgramTypes(data)) {
    const policies = targets
      .filter((target) => target.programType === programType)
      .map(({ policy }) => policy);
    // 'YYYY-MM-DDTHH:mm' 은 글자 순서가 시간 순서다
    const startDate = policies
      .map(({ applicationStartedAt }) => applicationStartedAt ?? '')
      .sort()[0];
    const endDate = policies
      .map(({ applicationEndedAt }) => applicationEndedAt ?? '')
      .sort()
      .at(-1);
    const draft = data.programForms[programType];
    const { id } = await createProgramForm(expoId, {
      title: PROGRAM_FORM_TITLE[programType],
      informationText: draft.informationText,
      participantType: FORM_PARTICIPANT_TYPE[programType],
      startDate: toOffsetDateTime(startDate) ?? '',
      endDate: toOffsetDateTime(endDate ?? null) ?? '',
      dynamicForm: draft.dynamicForm.map(
        ({ title, formType, jsonData, requiredStatus, otherJson }) => ({
          title,
          formType,
          jsonData,
          requiredStatus,
          otherJson,
          dynamicFormType: 'DEFAULT',
        }),
      ),
    });
    formIds[programType] = id;
  }

  // 생성 응답에는 회차 ID 가 없어 구분·이름·시작 시각으로 방금 만든 회차를 찾는다
  const unmatched = [...(await getSchedulePrograms(expoId))];
  for (const { programType, item, policy } of targets) {
    const key = sessionKey(programType, item.title, item.startedAt);
    const index = unmatched.findIndex(
      (program) =>
        sessionKey(program.programType, program.title, program.startedAt) ===
        key,
    );
    if (index < 0)
      throw new Error(
        `'${item.title}' 회차를 찾지 못해 신청 설정을 저장하지 못했습니다.`,
      );
    const [program] = unmatched.splice(index, 1);
    await patchScheduleProgram(program, {
      title: program.title,
      startedAt: toProgramDateTime(program.startedAt),
      endedAt: toProgramDateTime(program.endedAt),
      place: program.place ?? null,
      ...(program.category ? { category: program.category } : {}),
      policy: toProgramPolicy(toPolicyForm(policy, formIds[programType])),
    });
  }
};
