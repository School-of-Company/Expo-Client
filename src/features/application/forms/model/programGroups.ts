import type { OwnerApplication, OwnerParticipant } from '../api/myApplications';
import type { Program, ProgramType } from '@/shared/types/program/list/type';

/**
 * 서버 groupId 로 묶은 프로그램 묶음. 제목은 묶음 기준이 아니다.
 * groupId 가 없는 프로그램은 자기 자신만 회차로 갖는 독립 묶음이다.
 */
export interface ProgramGroup {
  key: string;
  groupId: string | null;
  sessions: Program[];
}

// 응답 최상위 groupId 와 policy.groupId 는 같은 값이다. 둘 중 있는 것을 쓰고 빈 문자열은 없음으로 본다
export const getProgramGroupId = (
  program: Pick<Program, 'groupId' | 'policy'>,
): string | null =>
  program.groupId?.trim() || program.policy?.groupId?.trim() || null;

const byStart = (a: Program, b: Program) =>
  a.startedAt.localeCompare(b.startedAt) || a.id - b.id;

export const groupPrograms = (programs: Program[]): ProgramGroup[] => {
  const groups = new Map<string, ProgramGroup>();
  programs.forEach((program) => {
    const groupId = getProgramGroupId(program);
    // 타입이 다르면 같은 groupId 라도 합치지 않는다
    const key = groupId
      ? `group:${program.programType}:${groupId}`
      : `solo:${program.programType}:${program.id}`;
    const group = groups.get(key);
    if (group) group.sessions.push(program);
    else groups.set(key, { key, groupId, sessions: [program] });
  });
  return Array.from(groups.values()).map((group) => ({
    ...group,
    sessions: [...group.sessions].sort(byStart),
  }));
};

export interface GroupApplication {
  application: OwnerApplication;
  participantName: string;
  session: Program;
}

/**
 * 묶음 안 회차에 대한 참가자별 기존 활성(CONFIRMED/WAITING) 신청.
 * 안내용이며 중복 여부의 최종 판정은 서버가 한다.
 * 내 신청 응답에 groupId 가 없어 회차 식별자(타입+programId)로 묶음 소속을 본다.
 */
export const getGroupApplications = (
  group: ProgramGroup,
  programType: ProgramType,
  applications: OwnerApplication[],
  participants: Pick<OwnerParticipant, 'participantId' | 'name'>[],
): GroupApplication[] =>
  applications.flatMap((application) => {
    if (
      application.type !== programType ||
      (application.status !== 'CONFIRMED' && application.status !== 'WAITING')
    )
      return [];
    const session = group.sessions.find(
      (s) => s.id === application.sessionOrProgramId,
    );
    if (!session) return [];
    const participant = participants.find(
      (p) => p.participantId === application.participantId,
    );
    return [
      {
        application,
        session,
        participantName:
          participant?.name ?? `참가자 ${application.participantId}`,
      },
    ];
  });
