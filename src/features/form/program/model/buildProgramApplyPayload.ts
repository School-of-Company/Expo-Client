import { buildSurveyAnswers } from '@/features/application/lib/process/buildSurveyAnswers';
import { DynamicFormValues } from '@/shared/types/application/type';
import { ProgramForm } from '@/shared/types/form/program/type';

/**
 * 프로그램 신청 제출 payload. 폼을 불러온 시점의 `version` 을 같이 보내서,
 * 그사이 폼이 바뀌었으면 서버가 거절하고 화면이 최신 폼을 다시 불러오게 한다.
 *
 * 답변은 `{ "<문항 id>": 값 }` 이고 선택지 값은 표시 문구가 아니라 `jsonData` 키다.
 * 렌더러가 선택지 값으로 이미 키를 쓰므로(formAdapter) 그대로 실린다.
 */
// TODO(api): 버전 키 이름은 Application #43 계약에서 확정된다. 확정되면 맞춘다.
export const buildProgramApplyPayload = (
  form: ProgramForm,
  values: DynamicFormValues,
) => ({
  formVersion: form.version,
  answers: buildSurveyAnswers(values, form.dynamicForm),
});
