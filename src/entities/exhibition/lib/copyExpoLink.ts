import { toast } from 'react-toastify';

/** 사이트 안 경로를 전체 주소로 바꿔 복사한다 */
export const copyExpoLink = async (path: string, label = '링크') => {
  try {
    await navigator.clipboard.writeText(`${window.location.origin}${path}`);
    toast.success(`${label}를 복사했습니다.`);
  } catch {
    toast.error(`${label}를 복사하지 못했습니다. 다시 시도해주세요.`);
  }
};
