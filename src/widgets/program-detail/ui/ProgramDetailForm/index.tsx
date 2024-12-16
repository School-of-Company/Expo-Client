'use client';

import { useSearchParams } from 'next/navigation';
import withLoading from '@/shared/hocs/withLoading';
import { fileActions } from '@/shared/model/footerActions';
import { TableForm } from '@/shared/ui/Table';
import { programCategories } from '../../model/category';
import { useProgramDetailQueries } from '../../model/useProgramDetailData';

const ProgramDetailForm = ({ id }: { id: number }) => {
  const searchParams = useSearchParams();
  const navigation = searchParams.get('navigation') || 'standard';
  const { programDetailQueries, isLoading } = useProgramDetailQueries(
    id,
    navigation,
  );

  const programDetailData = programDetailQueries.data || [];

  return withLoading({
    isLoading,
    children: (
      <div className="mx-auto w-full max-w-[1200px] space-y-[46px] px-5">
        <p className="text-center text-h2 text-black">프로그램</p>
        <TableForm
          categories={programCategories}
          data={programDetailData}
          maxHeight="414px"
          footerType="file"
          text="인원 수"
          actions={fileActions(id)}
        />
      </div>
    ),
  });
};

export default ProgramDetailForm;
