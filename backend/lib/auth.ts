/**
 * Stateless member sessions + password helpers for the serverless runtime.
 *
 * The original Express server kept sessions in a Map, which cannot survive
 * Vercel cold starts. Here the member token is a signed payload:
 *
 *   base64url(JSON payload) + "." + base64url(HMAC-SHA256)
 *
 * so /api/auth/me can verify it without any server memory.
 */
import crypto from 'node:crypto';
import { TOKEN_SECRET, ADMIN_SALT } from './env.js';

const MEMBER_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromB64url(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

function sign(payload: string): string {
  return b64url(crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest());
}

export interface MemberTokenPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

export function signMemberToken(memberId: string, email: string): string {
  const payload: MemberTokenPayload = {
    sub: memberId,
    email,
    iat: Date.now(),
    exp: Date.now() + MEMBER_TTL_MS,
  };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifyMemberToken(token: string): MemberTokenPayload | null {
  if (!token || !token.includes('.')) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(fromB64url(body).toString('utf8')) as MemberTokenPayload;
    if (!payload?.sub || typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Reads a member token from Authorization / x-member-token headers or a body/query field. */
export function readToken(req: any): string {
  const authHeader = req?.headers?.authorization || req?.headers?.Authorization || '';
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const headerToken = req?.headers?.['x-member-token'];
  if (typeof headerToken === 'string' && headerToken.trim()) return headerToken.trim();
  if (req?.body?.token) return String(req.body.token).trim();
  if (req?.query?.token) return String(req.query.token).trim();
  return '';
}

/** sha256(password + salt) — matches the original Express implementation. */
export function hashWithSalt(password: string, salt: string): string {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

export function hashAdminPassword(password: string): string {
  return hashWithSalt(password, ADMIN_SALT);
}

export function newSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function randomCode(prefix: string, name: string): string {
  const initials = (name || 'VIP').replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'PHX';
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${initials}-${suffix}`;
}

/** Public shape of a member record — password fields stripped. */
export function publicMember(row: any): Record<string, any> {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    birthdate: row.birthdate || null,
    claims: row.claims || {},
    created_at: row.created_at,
    last_login: row.last_login,
    sign_in_count: row.sign_in_count || 1,
  };
}
