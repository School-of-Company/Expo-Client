import {
  KakaoTemplate,
  KakaoVariableMapping,
} from '../../common/api/groupMessageApi';

/** 문자(SMS) 내용을 채우는 예시 문구. 변수는 서버가 신청별로 바꾼다 */
export interface MessageTemplate {
  id: string;
  label: string;
  body: string;
}

/** 카카오 템플릿 변수가 가리키는 신청 값 → 같은 값을 채우는 문자 변수 */
const SMS_VARIABLE: Record<
  Exclude<keyof KakaoVariableMapping, 'expoName'>,
  string
> = {
  name: '{이름}',
  programName: '{프로그램}',
  sessionName: '{일시}',
  location: '{장소}',
  status: '{상태}',
  applicationUrl: '{URL}',
  applicationSummary: '{신청내역}',
};

const EXPO_NAME_PLACEHOLDER = '#{행사명}';

const replaceAll = (text: string, from: string, to: string) =>
  text.split(from).join(to);

// 행사명은 고정하지 않고 선택한 박람회 제목을 쓴다. 제목이 없으면 머리말에서 뺀다.
// 제목이 이미 '['로 시작하면(예: [QA 전용] …) 괄호를 겹치지 않는다
const toSmsBody = (
  { content, variableMapping, fixedVariables }: KakaoTemplate,
  expoTitle: string,
) => {
  const title = expoTitle.trim();
  const label = title.startsWith('[') ? title : `[${title}]`;
  const expoName = variableMapping.expoName ?? EXPO_NAME_PLACEHOLDER;
  let body = replaceAll(content, `[${expoName}]`, title ? label : '');
  body = replaceAll(body, expoName, title);
  (
    Object.entries(variableMapping) as [
      keyof KakaoVariableMapping,
      string | undefined,
    ][]
  ).forEach(([key, placeholder]) => {
    if (key === 'expoName' || !placeholder || !SMS_VARIABLE[key]) return;
    body = replaceAll(body, placeholder, SMS_VARIABLE[key]);
  });
  // 고정 변수는 문자 변수가 아니라 값 그대로 넣는다
  Object.entries(fixedVariables ?? {}).forEach(([placeholder, value]) => {
    body = replaceAll(body, placeholder, value);
  });
  return body.trimStart();
};

// 카톡 템플릿 본문과 문자 본문은 같은 문구로 관리한다. 승인 템플릿이 없으면 예시도 없다
export const getMessageTemplates = (
  templates: KakaoTemplate[],
  expoTitle: string,
): MessageTemplate[] =>
  templates.map((template) => ({
    id: template.id,
    label: template.name,
    body: toSmsBody(template, expoTitle),
  }));
