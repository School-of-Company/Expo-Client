const PADDING = 24;
const FONT_SIZE = 36;
const LINE_HEIGHT = 48;

// 문구가 QR 너비를 넘지 않게 글자 단위로 줄바꿈
const wrapCaption = (
  context: CanvasRenderingContext2D,
  caption: string,
  maxWidth: number,
) => {
  const lines: string[] = [];
  let line = '';
  for (const char of caption) {
    if (line && context.measureText(line + char).width > maxWidth) {
      lines.push(line);
      line = char;
    } else {
      line += char;
    }
  }
  lines.push(line);
  return lines;
};

// QR 아래에 문구를 붙여 한 장의 이미지로 저장
export const downloadQrImage = (qr: HTMLCanvasElement, caption: string) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  const font = `600 ${FONT_SIZE}px Pretendard, sans-serif`;
  const width = qr.width + PADDING * 2;

  context.font = font;
  const lines = wrapCaption(context, caption, width - PADDING * 2);

  // 캔버스 크기를 바꾸면 컨텍스트가 초기화되므로 크기 지정 뒤에 다시 그린다
  canvas.width = width;
  canvas.height = qr.height + PADDING * 2 + lines.length * LINE_HEIGHT;
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(qr, PADDING, PADDING);
  context.fillStyle = '#121212';
  context.font = font;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  lines.forEach((text, index) => {
    context.fillText(
      text,
      width / 2,
      qr.height + PADDING * 2 + LINE_HEIGHT * (index + 0.5),
    );
  });

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `${caption}_QR.png`;
  link.click();
};
