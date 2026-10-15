'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ProgramFormResponseDto, useProgramFormsQuery } from '@/entities/form';
import { withLoading } from '@/shared/hocs';
import { Button, Input } from '@/shared/ui';
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
  getLinkedFormIds,
  getProgramsUsingForm,
} from '../../model/programFormLink';
import ScheduleSection from '../ScheduleSection';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 이 행사 프로그램용 폼 목록. 등록용 신청 폼·만족도 조사는 박람회 운영에서 관리한다.
 * 행사별 폼 목록 API(Expo-Form-Server#141)가 없어 회차에 연결된 폼만 보여 준다
 */
const ProgramFormList = () => {
  const router = useRouter();
  const { expoId, routes } = useRegistrationExpo();
  const programsQuery = useSchedulePrograms(expoId);
  const programs = programsQuery.data ?? [];
  const results = useProgramFormsQuery(getLinkedFormIds(programs));
  const forms = results.flatMap(({ data }) => (data ? [data] : []));
  const [idInput, setIdInput] = useState('');

  const columns: TableColumn<ProgramFormResponseDto>[] = [
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
      key: 'questions',
      label: '질문',
      flex: 0.4,
      render: ({ dynamicForm }) => dynamicForm.length,
    },
    {
      key: 'sessions',
      label: '연결 회차',
      flex: 1.8,
      render: ({ id }) => (
        <p className="truncate">
          {getProgramsUsingForm(programs, id)
            .map(({ title }) => title)
            .join(', ')}
        </p>
      ),
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
    isLoading: programsQuery.isLoading || results.some((r) => r.isLoading),
    children: (
      <div className="w-full max-w-[1200px] space-y-[30px] pb-[120px]">
        {programsQuery.error ? (
          <SectionError
            message={programsQuery.error.message}
            onRetry={() => void programsQuery.refetch()}
          />
        ) : (
          <ScheduleSection
            title="프로그램용 폼"
            description="회차 신청에 쓰는 폼입니다. 질문·필수 여부·안내·응답 기간은 폼에서, 신청 자격·정원·대기·모집 조건은 일정·모집의 회차에서 정합니다. 등록용 신청 폼과 만족도 조사는 박람회 운영에서 관리합니다."
          >
            <div className="flex items-center justify-between gap-16 mobile:flex-col mobile:items-stretch">
              <p className="text-caption1r text-gray-500">
                회차에 연결된 폼만 보입니다. 연결 전인 폼은 편집 화면 주소의 ID
                로 열 수 있습니다.
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
              emptyText="회차에 연결된 프로그램용 폼이 없습니다."
              footerText="프로그램용 폼"
              footerCount={forms.length}
              minWidth="900px"
              maxHeight="none"
            />
            <div className="flex max-w-[480px] gap-8">
              <Input
                size="small"
                aria-label="폼 ID로 열기"
                placeholder="폼 ID"
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
              />
              <button
                type="button"
                className="shrink-0 rounded-sm border-1 border-solid border-gray-200 px-16 text-caption1b text-gray-500 duration-200 hover:border-main-600 hover:text-main-600 disabled:opacity-40"
                disabled={!UUID_PATTERN.test(idInput.trim())}
                onClick={() =>
                  router.push(routes.programForm(idInput.trim().toLowerCase()))
                }
              >
                열기
              </button>
            </div>
          </ScheduleSection>
        )}
      </div>
    ),
  });
};

export default ProgramFormList;
