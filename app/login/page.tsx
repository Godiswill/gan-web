import { redirect } from 'next/navigation';
import { auth } from '@/lib/utils/auth';
import SignInForm from '@/components/SignInForm';

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    console.log(session);
    redirect('/');
  }

  return (
    <div className="m-auto mt-24 w-full max-w-md rounded-xl border bg-card p-6 shadow">
      <h1 className="mb-6 text-center text-2xl font-semibold">Sign in</h1>
      <SignInForm />
    </div>
  );
}
