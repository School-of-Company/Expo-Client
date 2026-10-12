import { isAxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { deleteAuthCookies } from '@/shared/libs/cookie/deleteCookies';
import { callWithAdminToken } from '@/shared/libs/handler/adminTokenRequest';
import { serverInstance } from '@/shared/libs/http/serverInstance';

// 서버에서 리프레시 토큰을 폐기하고 쿠키를 지운다. 서버 호출이 실패해도 이 브라우저는 로그아웃시킨다
export async function DELETE() {
  try {
    await callWithAdminToken((accessToken) =>
      serverInstance.delete('/auth', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    );
    return deleteAuthCookies(NextResponse.json({ success: true }));
  } catch (error) {
    const message = isAxiosError(error)
      ? error.response?.data?.message
      : undefined;
    return deleteAuthCookies(
      NextResponse.json({
        success: true,
        // 서버 세션 폐기에 실패했지만 쿠키는 지웠다
        warning: message || '서버 로그아웃 처리에 실패했습니다.',
      }),
    );
  }
}
