import { toFormError } from '@/features/form/common/api/formErrors';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { ApplicationType } from '@/shared/types/exhibition/type';

/** 폼과 딸린 입력 필드를 함께 삭제한다. 대상은 (박람회, 참여자군, 신청방식) 조합이다. */
export const deleteApplicationForm = async (
  expoId: string,
  participationType: 'STANDARD' | 'TRAINEE',
  applicationType: ApplicationType,
) => {
  try {
    await clientTokenInstance.delete(
      `/forms/${expoId}/${participationType}/${applicationType}`,
    );
  } catch (error) {
    throw toFormError(error, '박람회 등록 폼 삭제 실패');
  }
};
