import { NextRequest } from 'next/server';
import { auth } from '@/lib/utils/auth';
import { fail } from '@/lib/services/apiRes';

export interface WithAuthOptions {
  required?: boolean; // 是否必须登录
  roles?: string[]; // 允许的角色列表
  // onError?: (error: AuthError) => NextResponse; // 自定义错误处理
}

export default function withAuth(
  handler: Function,
  options: WithAuthOptions = {}
) {
  const { required = true, roles = [] } = options;

  return async (req: NextRequest, ...args: any[]) => {
    const session = await auth();
    console.log('session', session);
    const { user } = session || {};

    if (required && !user) {
      return fail(401);
    }

    // 3. 检查角色权限
    if (user && roles.length > 0) {
      if (!user.role || !roles.includes(user.role)) {
        return fail(403);
      }
    }

    // 注入 session 信息，方便 handler 使用
    return handler(req, ...args, session);
  };
}

/**
 * 可选认证：允许未登录用户访问，但会传递用户信息（如果已登录）
 */
export function withOptionalAuth(handler: Function) {
  return withAuth(handler, { required: false });
}

/**
 * 角色认证：只允许特定角色访问
 */
export function withRole(roles: string[], handler: Function) {
  return withAuth(handler, { required: true, roles });
}
