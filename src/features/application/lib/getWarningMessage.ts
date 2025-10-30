import { ApplicationType } from '@/shared/types/exhibition/type';

export const getWarningMessage = (
  formType: 'application' | 'survey' | null,
  applicationType: ApplicationType | null,
): string | null => {
  if (formType === 'application' && applicationType === 'PRE') {
    return `• 같은 번호로는 중복 등록이 불가능해요\n• 휴대폰이 없으신 경우, 행사 당일 현장에서도 접수할 수 있어요`;
  }
  if (formType === 'application' && applicationType === 'FIELD') {
    return `• 같은 번호로는 중복 등록이 불가능해요\n• 휴대폰이 없으신 경우에는 임시 QR 발급을 도와드릴 수 있으니, 현장 관리자에게 말씀해주세요`;
  }
  return null;
};
