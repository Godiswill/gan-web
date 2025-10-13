import NextAuth from 'next-auth';

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: string;
  membershipType: string;
  membershipExpiresAt: string;
  credits: number;
  role?: string;
  createdAt: string;
  updateAt: string;
}

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: User;
  }
}
