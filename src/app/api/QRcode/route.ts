import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { scannedData } = await request.json();

  const isValid = validateQRData(scannedData);

  if (isValid) {
    const userInfo = {
      name: '이다한',
      email: 'test1234@gmail.com',
      number: '010-1234-1234',
    };
    return NextResponse.json(userInfo);
  } else {
    return NextResponse.json({ error: 'Invalid QR code' }, { status: 400 });
  }
}

function validateQRData(data: string) {
  return data === 'MN-003533-01';
}
