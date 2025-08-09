import crypto from 'crypto';
import { User } from '../user/user.service';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function generateToken(user: User): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(
    JSON.stringify({ sub: user.email, iat: Math.floor(Date.now() / 1000) })
  );
  const signature = base64url(
    crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest()
  );
  return `${header}.${payload}.${signature}`;
}
