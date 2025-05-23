export const printBadge = (selectedData: {
  name: string;
  qrCode: string;
  isTemporary: boolean;
}) => {
  const printWindow = window.open('', '_blank');

  if (printWindow) {
    const isBase64 =
      selectedData.qrCode &&
      (selectedData.qrCode.startsWith('/9j/') ||
        selectedData.qrCode.includes('base64'));

    const encodedQRCode = encodeURIComponent(selectedData.qrCode);

    printWindow.document.write(`
      <html>
        <head>
          <title>Badge</title>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
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
              text-align: center;
              padding: 20px;
              width: 100%;
            }
            .badge h1 {
              font-size: 24px;
              margin-bottom: 10px;
              font-weight: bold;
            }
            .badge p {
              margin: 5px 0;
              font-size: 16px;
              color: #555;
            }
            .qr-container {
              margin-top: 20px;
              display: flex;
              justify-content: center;
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
            <h1>${selectedData.name}</h1>
            ${selectedData.isTemporary ? `<p style="font-size:14px;">(임시 QR)</p>` : ''}
            <div class="qr-container">
              ${
                isBase64
                  ? `<img src="data:image/png;base64,${selectedData.qrCode}" alt="QR Code" width="100" height="100" />`
                  : `<div id="qrcode"></div>`
              }
            </div>
          </div>
          <script>
            ${
              !isBase64
                ? `
                  const decodedQRText = decodeURIComponent("${encodedQRCode}");
                  new QRCode("qrcode", {
                    text: decodedQRText,
                    width: 150,
                    height: 150
                  });
                `
                : ''
            }
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
