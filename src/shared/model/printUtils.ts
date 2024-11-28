export const printBadge = (selectedData: {
  name: string;
  affiliation: string;
  qrCode: string; // 기존과 동일하게 qrCode 사용
}) => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
        </head>
        <body>
          <div>
            <h2>${selectedData.name} (${selectedData.affiliation})</h2>
            <div id="qrcode"></div>
          </div>
          <script>
            const qrCode = new QRCode("qrcode", {
              text: "${selectedData.qrCode}",
              width: 128,
              height: 128
            });
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
};
