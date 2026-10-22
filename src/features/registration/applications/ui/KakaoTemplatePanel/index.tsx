import {
  KakaoTemplate,
  KakaoVariableMapping,
} from '../../../common/api/groupMessageApi';

/** 서버가 템플릿 자리표시자에 채우는 신청 값. 관리자가 직접 입력하지 않는다 */
const MAPPING_LABEL: Record<keyof KakaoVariableMapping, string> = {
  expoName: '박람회 제목',
  name: '참가자 이름',
  programName: '프로그램 제목',
  sessionName: '회차 일시',
  location: '장소',
  status: '신청 상태',
  applicationUrl: '내 신청 QR 페이지 링크',
  applicationSummary: '신청 내역',
};

const KakaoTemplatePanel = ({ template }: { template: KakaoTemplate }) => {
  const mappings = (
    Object.entries(template.variableMapping) as [
      keyof KakaoVariableMapping,
      string | undefined,
    ][]
  ).filter(([, placeholder]) => placeholder);
  // 모든 수신자에게 같은 값으로 들어가는 변수
  const fixed = Object.entries(template.fixedVariables ?? {});

  return (
    <div className="space-y-12 rounded-sm border-1 border-solid border-gray-200 px-16 py-12">
      <p className="whitespace-pre-wrap text-body2r text-black">
        {template.content}
      </p>
      {(mappings.length > 0 || fixed.length > 0) && (
        <dl className="space-y-4 text-caption1r text-gray-500">
          {mappings.map(([key, placeholder]) => (
            <div key={key} className="flex gap-8">
              <dt className="font-mono">{placeholder}</dt>
              <dd>← {MAPPING_LABEL[key]}</dd>
            </div>
          ))}
          {fixed.map(([placeholder, value]) => (
            <div key={placeholder} className="flex gap-8">
              <dt className="font-mono">{placeholder}</dt>
              <dd className="break-all">← 고정값 {value}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="text-caption1r text-gray-400">
        변수 값은 신청 시점 정보로 서버가 채웁니다. 값이 없는 신청은
        미리보기에서 제외 사유로 표시됩니다.
      </p>
      <p className="text-caption1r text-gray-400">
        카카오 알림톡과 같은 내용의 문자를 함께 보냅니다. 카카오톡을 받을 수
        없는 번호는 문자만 받습니다.
      </p>
    </div>
  );
};

export default KakaoTemplatePanel;
