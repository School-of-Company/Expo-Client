import React from 'react';

interface PrintBadgeProps {
  selectedData: {
    name: string;
    affiliation: string;
    qrCode: string;
  };
}

const PrintBadge = ({ selectedData }: PrintBadgeProps) => {
  React.useEffect(() => {
    const printContents = `
      <div>
        <h2>${selectedData.name} (${selectedData.affiliation})</h2>
        <img src="${selectedData.qrCode}" alt="QR Code" />
      </div>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code</title>
          </head>
          <body onload="window.print(); window.close();">
            ${printContents}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }, [selectedData]);

  return null;
};

export default PrintBadge;
