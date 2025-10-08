import { NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/types';

export const ok = <T>(data?: T, message?: string) =>
  NextResponse.json<ApiResponse<T>>({
    code: 0,
    success: true,
    data,
    message,
  });

export const fail = (code: number, message: string, status = 500) =>
  NextResponse.json<ApiResponse>(
    {
      code,
      success: false,
      message,
    },
    { status }
  );
