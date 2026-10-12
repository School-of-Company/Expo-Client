import { isAxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { deleteAuthCookies } from '@/shared/libs/cookie/deleteCookies';
import {
  AuthExpiredError,
  callWithAdminToken,
} from '@/shared/libs/handler/adminTokenRequest';
import { serverInstance } from '@/shared/libs/http/serverInstance';

export async function DELETE() {
  try {
    await callWithAdminToken((accessToken) =>
      serverInstance.delete('/admin', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    );
    return deleteAuthCookies(NextResponse.json({ success: true }));
  } catch (error) {
    // 로그인이 만료되면 탈퇴할 수 없으니 쿠키를 지우고 다시 로그인하게 한다
    if (error instanceof AuthExpiredError) {
      return deleteAuthCookies(
        NextResponse.json(
          { error: error.message, status: 401, isRefreshError: true },
          { status: 401 },
        ),
      );
    }
    const status = isAxiosError(error) ? error.response?.status || 500 : 500;
    const message =
      (isAxiosError(error) && error.response?.data?.message) ||
      '회원 탈퇴에 실패했습니다.';
    return NextResponse.json({ error: message, status }, { status });
  }
}
