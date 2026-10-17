import crypto from 'crypto';

export const COOKIE = 'ostati_admin';

function password() {
  return process.env.ADMIN_PASSWORD || '';
}

// Session token = HMAC of a fixed label with the password.
// Changing ADMIN_PASSWORD logs everyone out automatically.
export function sessionToken() {
  return crypto.createHmac('sha256', password()).update('ostati-admin-session').digest('hex');
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function checkPassword(input) {
  return password().length > 0 && safeEqual(input, password());
}

export function isAuthed(request) {
  if (!password()) return false;
  const token = request.cookies.get(COOKIE)?.value;
  return !!token && safeEqual(token, sessionToken());
}
