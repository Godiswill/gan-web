import { NextResponse } from 'next/server';
import { ApiResponse, ErrorCodeStatus, ErrorStatus } from '@/lib/types';
import { ERROR_CODE_MAP } from '@/lib/utils/const';

export const ok = <T>(data?: T, message?: string) =>
  NextResponse.json<ApiResponse<T>>({
    success: true,
    data,
    message,
  });

export const fail = (status: ErrorStatus, _code?: ErrorCodeStatus) => {
  const code: ErrorCodeStatus = _code || status;

  return NextResponse.json<ApiResponse>(
    {
      success: false,
      code,
      message: ERROR_CODE_MAP[code].message,
    },
    { status }
  );
};
