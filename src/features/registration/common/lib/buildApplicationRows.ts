import {
  RegistrationApplication,
  RegistrationOverview,
  RegistrationProgram,
  RegistrationSession,
} from '@/shared/types/registration/type';

export interface ApplicationRow extends RegistrationApplication {
  program: RegistrationProgram;
  session: RegistrationSession;
  /** 문자 발송에 사용할 번호. 개인 연락처가 없으면 인증에 사용한 대표 번호 */
  contactNumber: string;
}

export interface SessionStat {
  confirmed: number;
  waiting: number;
  canceled: number;
}

export const buildApplicationRows = ({
  programs,
  sessions,
  applications,
}: RegistrationOverview): ApplicationRow[] => {
  const programById = new Map(programs.map((program) => [program.id, program]));
  const sessionById = new Map(sessions.map((session) => [session.id, session]));

  return applications.flatMap((application) => {
    const program = programById.get(application.programId);
    const session = sessionById.get(application.sessionId);
    if (!program || !session) return [];
    return [
      {
        ...application,
        program,
        session,
        contactNumber:
          application.phoneNumber || application.verifiedPhoneNumber,
      },
    ];
  });
};

export const getSessionStats = (applications: RegistrationApplication[]) => {
  const stats = new Map<number, SessionStat>();
  applications.forEach(({ sessionId, status }) => {
    const stat = stats.get(sessionId) ?? {
      confirmed: 0,
      waiting: 0,
      canceled: 0,
    };
    if (status === 'CONFIRMED') stat.confirmed += 1;
    if (status === 'WAITING') stat.waiting += 1;
    if (status === 'CANCELED') stat.canceled += 1;
    stats.set(sessionId, stat);
  });
  return stats;
};
