import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { db } from './db'

const secretKey = process.env.JWT_SECRET || 'starlish-bimbel-secret-key-2024'
const key = new TextEncoder().encode(secretKey)

export interface SessionUser {
  id: string
  email: string
  name: string
  role: string
}

// Encrypt payload to JWT
export async function encrypt(payload: SessionUser) {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key)
}

// Decrypt JWT to payload
export async function decrypt(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, key)
    return payload as SessionUser
  } catch {
    return null
  }
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword)
}

// Hash password
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

// Get current session from cookies
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  return decrypt(token)
}

// Set session cookie
export async function setSession(user: SessionUser) {
  const token = await encrypt(user)
  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    path: '/',
  })
}

// Clear session cookie
export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

// Authenticate user
export async function authenticateUser(email: string, password: string): Promise<SessionUser | null> {
  const admin = await db.admin.findUnique({
    where: { email },
  })

  if (!admin || !admin.isActive) return null

  const isValid = await verifyPassword(password, admin.password)
  if (!isValid) return null

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  }
}

// Check if user is super admin
export function isSuperAdmin(user: SessionUser | null): boolean {
  return user?.role === 'super_admin'
}
