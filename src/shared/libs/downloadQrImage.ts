// QR 아래에 문구를 붙여 한 장의 이미지로 저장
export const downloadQrImage = (qr: HTMLCanvasElement, caption: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = qr.width;
  canvas.height = qr.height + 80;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(qr, 0, 0);
  context.fillStyle = '#121212';
  context.font = '600 36px Pretendard, sans-serif';
  context.textAlign = 'center';
  context.fillText(caption, canvas.width / 2, qr.height + 44);

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `${caption}_QR.png`;
  link.click();
};
