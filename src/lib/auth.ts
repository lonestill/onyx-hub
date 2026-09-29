import { NextRequest } from 'next/server';

/**
 * Checks whether the incoming request is authenticated as an admin.
 * Verifies either:
 *  1. 'onyx_session' HTTP-only cookie against process.env.ADMIN_SECRET
 *  2. 'Authorization: Bearer <secret>' or 'x-admin-token: <secret>' header
 */
export function isAuthorizedAdmin(req: NextRequest): boolean {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || typeof adminSecret !== 'string' || adminSecret.trim() === '') {
    return false;
  }

  // 1. Check Bearer authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token === adminSecret) {
      return true;
    }
  }

  // 2. Check custom header
  const customHeader = req.headers.get('x-admin-token');
  if (customHeader && customHeader.trim() === adminSecret) {
    return true;
  }

  // 3. Check session cookie
  const cookieSession = req.cookies.get('onyx_session')?.value;
  if (cookieSession && cookieSession === adminSecret) {
    return true;
  }

  return false;
}
