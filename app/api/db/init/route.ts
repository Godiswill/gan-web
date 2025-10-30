import { NextRequest } from 'next/server';
// import withAuth from '@/lib/services/withAuth';
import { ok, fail } from '@/lib/services/apiRes';
import { seedPlans } from '@/lib/db/init';

export const GET = async (_req: NextRequest) => {
  try {
    console.log('===== init database ======');
    await seedPlans();

    return ok(undefined, 'init success');
  } catch (error) {
    console.error('something wrong:', error);
    return fail(500);
  }
};
