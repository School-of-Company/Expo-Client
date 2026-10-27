// 목걸이 명찰 가운데 부착 영역에 들어가는 소속·이름만 출력한다
export const BADGE_PRINT_HTML = `
      <html>
        <head>
          <title>Badge</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .badge {
              box-sizing: border-box;
              width: 100%;
              padding: 20px;
              text-align: center;
            }
            .badge-school {
              margin: 0 0 40px;
              font-size: 28px;
              line-height: 1.4;
              color: #333;
              word-break: keep-all;
              overflow-wrap: anywhere;
            }
            .badge-name {
              margin: 0;
              font-size: 64px;
              line-height: 1.2;
              font-weight: bold;
              overflow-wrap: anywhere;
            }
            @media print {
              @page {
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
            window.onload = function() {
              window.print();
              window.close();
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
