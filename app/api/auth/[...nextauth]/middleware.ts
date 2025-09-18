// Add optional Middleware to keep the session alive, 
// this will update the session expiry every time its called.
export { auth as middleware } from '@/lib/utils/auth';
