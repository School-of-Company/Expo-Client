// 목걸이 명찰 가운데 부착 영역에 들어가는 소속·이름만 출력한다
// 인쇄 호출 방식만 다르고 레이아웃은 새 창(수동 출력)과 숨긴 iframe(출력대 자동 출력)이 같다
const BADGE_HTML_TEMPLATE = `
      <html>
        <head>
          <title>Badge</title>
          <style>
            @font-face {
              font-family: 'GMarketSans';
              src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff') format('woff');
              font-weight: 500;
              font-display: swap;
            }
            @font-face {
              font-family: 'GMarketSans';
              src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff') format('woff');
              font-weight: 700;
              font-display: swap;
            }
            body {
              font-family: 'GMarketSans', 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .badge {
              box-sizing: border-box;
              width: 80mm;
              padding: 10px;
              text-align: center;
            }
            .badge-school {
              margin: 0 0 10px;
              font-size: 30px;
              line-height: 1.4;
              font-weight: 500;
              color: #000;
              white-space: pre-line;
              word-break: keep-all;
              overflow-wrap: anywhere;
            }
            .badge-name {
              margin: 0;
              font-size: 54px;
              line-height: 1.2;
              font-weight: 700;
              overflow-wrap: anywhere;
            }
            @media print {
              @page {
                size: 80mm 56mm;
                margin: 0;
              }
              body {
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="badge">
            <p class="badge-school" id="badge-school"></p>
            <h1 class="badge-name" id="badge-name"></h1>
          </div>
          <script>
            // 긴 이름은 글자 크기를 유지한 채 줄바꿈하고, 전체가 영역 높이를 넘을 때만 글자 크기를 줄인다
            function fitBadge() {
              var badge = document.querySelector('.badge');
              var school = document.getElementById('badge-school');
              var name = document.getElementById('badge-name');
              var nameSize = 54;

              // 화면 창이 아니라 인쇄 용지(80x56mm) 크기를 기준으로, 프린터 비인쇄 영역을 감안해 여유를 두고 맞춘다
              var probe = document.createElement('div');
              probe.style.cssText = 'position:absolute;visibility:hidden;height:56mm;';
              document.body.appendChild(probe);
              var pageHeight = probe.offsetHeight - 16;
              document.body.removeChild(probe);

              // 전체가 용지 높이를 넘으면 소속과 이름을 함께 줄인다
              var schoolSize = 30;
              while (badge.offsetHeight > pageHeight && (schoolSize > 15 || nameSize > 24)) {
                if (school && schoolSize > 15) {
                  schoolSize -= 1;
                  school.style.fontSize = schoolSize + 'px';
                }
                if (nameSize > 24) {
                  nameSize -= 1;
                  name.style.fontSize = nameSize + 'px';
                }
              }
            }
            // 폰트가 늦거나 막혀도 3초 뒤에는 대체 폰트로 인쇄한다
            function waitBadgeFonts() {
              return Promise.race([
                Promise.all([
                  document.fonts.load('500 1em GMarketSans'),
                  document.fonts.load('700 1em GMarketSans'),
                ]),
                new Promise(function(resolve) { setTimeout(resolve, 3000); }),
              ]);
            }
            __BADGE_ON_LOAD__
          </script>
        </body>
      </html>
    `;

// 새 창: 열리면 스스로 맞추고 인쇄한 뒤 창을 닫는다
export const BADGE_PRINT_HTML = BADGE_HTML_TEMPLATE.replace(
  '__BADGE_ON_LOAD__',
  `window.onload = function() {
              var go = function() {
                fitBadge();
                window.print();
                window.close();
              };
              waitBadgeFonts().then(go, go);
            };`,
);

// 숨긴 iframe: 스스로 인쇄하지 않는다. 부모가 waitBadgeFonts → fitBadge → print 를 한 번만 부른다
export const BADGE_FRAME_HTML = BADGE_HTML_TEMPLATE.replace(
  '__BADGE_ON_LOAD__',
  '',
);

type BadgeTarget = {
  getElementById: (id: string) => {
    textContent: string | null;
    remove: () => void;
  } | null;
};

// 띄어쓰기 없는 긴 학교명이 글자 중간에서 끊기지 않도록 의미 단위 앞에만 줄바꿈 기회(ZWSP)를 둔다
const SCHOOL_BREAK_POINT =
  /(?<=.)(?=마이스터|과학|예술|외국어|국제|체육|공업|상업|여자|고등학교|중학교|초등학교|대학교|특별시|광역시)|(?<=교육청|교육원|지원청)(?=.)/g;

export const addSchoolBreakPoints = (school: string) =>
  school.replace(SCHOOL_BREAK_POINT, '\u200b');

// 외부 입력값이므로 HTML 파싱 없이 textContent 로만 주입한다. 소속이 없으면 소속 줄 자체를 뺀다
export const fillBadge = (
  doc: BadgeTarget,
  { school, name }: { school?: string | null; name: string },
) => {
  const schoolElement = doc.getElementById('badge-school');
  const schoolText = school?.trim();
  if (schoolElement) {
    if (schoolText)
      schoolElement.textContent = addSchoolBreakPoints(schoolText);
    else schoolElement.remove();
  }

  const nameElement = doc.getElementById('badge-name');
  if (nameElement) nameElement.textContent = name;
};
