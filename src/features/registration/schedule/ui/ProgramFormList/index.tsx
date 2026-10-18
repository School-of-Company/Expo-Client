'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ProgramFormListItemDto,
  useProgramFormListQuery,
} from '@/entities/form';
import { withLoading } from '@/shared/hocs';
import { Button } from '@/shared/ui';
import {
  formatDateTimeValue,
  fromOffsetDateTime,
  RegistrationTable,
  SectionError,
  TableColumn,
  useRegistrationExpo,
  useSchedulePrograms,
} from '../../../common';
import {
  FORM_PARTICIPANT_LABEL,
  getProgramsUsingForm,
} from '../../model/programFormLink';
import ScheduleSection from '../ScheduleSection';

/**
 * 이 행사 프로그램용 폼 전체 목록(Expo-Form-Server#141). 회차에 아직 연결하지 않은 폼도 보인다.
 * 신청관리 폼 탭에서 등록용 폼·만족도 조사 표 아래에 보인다
 */
const ProgramFormList = () => {
  const router = useRouter();
  const { expoId, routes } = useRegistrationExpo();
  const programsQuery = useSchedulePrograms(expoId);
  const programs = programsQuery.data ?? [];
  const formsQuery = useProgramFormListQuery(expoId);
  const forms = formsQuery.data ?? [];
  const error = programsQuery.error ?? formsQuery.error;

  const columns: TableColumn<ProgramFormListItemDto>[] = [
    {
      key: 'title',
      label: '폼 제목',
      flex: 1.6,
      render: ({ title }) => <p className="truncate text-black">{title}</p>,
    },
    {
      key: 'participantType',
      label: '대상',
      flex: 0.8,
      render: ({ participantType }) =>
        participantType
          ? FORM_PARTICIPANT_LABEL[participantType]
          : '회차에서 정함',
    },
    {
      key: 'period',
      label: '응답 기간',
      flex: 1.6,
      render: ({ startDate, endDate }) =>
        `${formatDateTimeValue(fromOffsetDateTime(startDate))} ~ ${formatDateTimeValue(fromOffsetDateTime(endDate))}`,
    },
    {
      key: 'version',
      label: '버전',
      flex: 0.4,
      render: ({ version }) => version,
    },
    {
      key: 'sessions',
      label: '연결 회차',
      flex: 1.8,
      render: ({ id }) => {
        const linked = getProgramsUsingForm(programs, id);
        return linked.length ? (
          <p className="truncate">
            {linked.map(({ title }) => title).join(', ')}
          </p>
        ) : (
          <p className="text-gray-400">연결 전</p>
        );
      },
    },
    {
      key: 'actions',
      label: '관리',
      flex: 0.5,
      render: ({ id }) => (
        <Link
          href={routes.programForm(id)}
          className="text-body2r text-main-600"
        >
          편집
        </Link>
      ),
    },
  ];

  return withLoading({
    isLoading: programsQuery.isLoading || formsQuery.isLoading,
    children: (
      <div className="w-full space-y-[30px]">
        {error ? (
          // 목록 조회 실패를 폼이 없는 것처럼 보이지 않게 따로 알린다
          <SectionError
            message={error.message}
            onRetry={() => {
              void programsQuery.refetch();
              void formsQuery.refetch();
            }}
          />
        ) : (
          <ScheduleSection
            title="프로그램용 폼"
            description="회차 신청에 쓰는 폼입니다. 질문·필수 여부·안내·응답 기간은 폼에서, 신청 자격·정원·대기·모집 조건은 프로그램·연수 탭의 회차에서 정합니다."
          >
            <div className="flex items-center justify-between gap-16 mobile:flex-col mobile:items-stretch">
              <p className="text-caption1r text-gray-500">
                폼을 먼저 만들어 두고, 프로그램·연수 탭의 회차에서 제목으로 골라
                연결할 수 있습니다.
              </p>
              <div className="w-[200px] shrink-0 mobile:w-full">
                <Button onClick={() => router.push(routes.programFormNew)}>
                  새 프로그램 폼
                </Button>
              </div>
            </div>
            <RegistrationTable
              columns={columns}
              rows={forms}
              emptyText="아직 만든 프로그램용 폼이 없습니다."
              footerText="프로그램용 폼"
              footerCount={forms.length}
              minWidth="900px"
              maxHeight="none"
            />
          </ScheduleSection>
        )}
      </div>
    ),
  });
};

export default ProgramFormList;
