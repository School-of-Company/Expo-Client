// 목걸이 명찰 가운데 부착 영역에 들어가는 소속·이름만 출력한다
export const BADGE_PRINT_HTML = `
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
              width: 100%;
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
                size: 3in 2in;
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

              // 전체가 화면 높이를 넘으면 소속과 이름을 함께 줄인다
              var schoolSize = 30;
              while (badge.offsetHeight > window.innerHeight && (schoolSize > 15 || nameSize > 24)) {
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
            window.onload = function() {
              var go = function() {
                fitBadge();
                window.print();
                window.close();
              };
              // 폰트가 늦거나 막혀도 3초 뒤에는 대체 폰트로 인쇄한다
              Promise.race([
                Promise.all([
                  document.fonts.load('500 1em GMarketSans'),
                  document.fonts.load('700 1em GMarketSans'),
                ]),
                new Promise(function(resolve) { setTimeout(resolve, 3000); }),
              ]).then(go, go);
            };
          </script>
        </body>
      </html>
    `;

type BadgeTarget = {
  getElementById: (id: string) => {
    textContent: string | null;
    remove: () => void;
  } | null;
};

// 외부 입력값이므로 HTML 파싱 없이 textContent 로만 주입한다. 소속이 없으면 소속 줄 자체를 뺀다
export const fillBadge = (
  doc: BadgeTarget,
  { school, name }: { school?: string | null; name: string },
) => {
  const schoolElement = doc.getElementById('badge-school');
  const schoolText = school?.trim();
  if (schoolElement) {
    if (schoolText) schoolElement.textContent = schoolText;
    else schoolElement.remove();
  }

  const nameElement = doc.getElementById('badge-name');
  if (nameElement) nameElement.textContent = name;
};
