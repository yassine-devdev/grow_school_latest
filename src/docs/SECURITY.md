# Security Guide

This document outlines the security measures, best practices, and implementation details for the Grow School application.

## Security Overview

Grow School implements multiple layers of security to protect user data, prevent unauthorized access, and ensure compliance with educational data privacy regulations.

## Authentication & Authorization

### 1. Authentication System

**JWT-based Authentication:**
```typescript
// lib/auth.ts
import jwt from 'jsonwebtoken';

export function generateToken(user: User): string {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET!,
    { 
      expiresIn: '24h',
      issuer: 'grow-school',
      audience: 'grow-school-users'
    }
  );
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
}
```

**Password Security:**
```typescript
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
  password: string, 
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### 2. Role-Based Access Control (RBAC)

**Permission System:**
```typescript
// lib/authorization.ts
export enum Permission {
  READ_USER = 'read_user',
  CREATE_JOURNAL = 'create_journal',
  USE_AI_ASSISTANT = 'use_ai_assistant',
  MANAGE_STUDENTS = 'manage_students',
  MANAGE_SYSTEM = 'manage_system'
}

export function hasPermission(
  user: User, 
  permission: Permission
): boolean {
  return user.permissions.includes(permission);
}

export function requirePermission(permission: Permission) {
  return (req: NextRequest, res: NextResponse, next: NextFunction) => {
    const user = req.user;
    
    if (!user || !hasPermission(user, permission)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    next();
  };
}
```

**Middleware Protection:**
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const payload = verifyToken(token);
    
    // Add user to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-role', payload.role);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ['/api/protected/:path*', '/dashboard/:path*']
};
```

## Data Protection

### 1. Input Validation

**Zod Schema Validation:**
```typescript
// backend/validation/schemas.ts
import { z } from 'zod';

export const CreateJournalEntrySchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title too long')
    .regex(/^[a-zA-Z0-9\s\-_.,!?]+$/, 'Invalid characters'),
  
  content: z.string()
    .min(1, 'Content is required')
    .max(10000, 'Content too long'),
  
  mood: z.enum(['happy', 'sad', 'neutral', 'excited', 'anxious']),
  
  isPrivate: z.boolean().default(true),
  
  tags: z.array(z.string().max(50)).max(10).optional()
});

export const validateInput = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } => {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => e.message).join(', ')
      };
    }
    return { success: false, error: 'Validation failed' };
  }
};
```

### 2. SQL Injection Prevention

**Parameterized Queries:**
```typescript
// backend/repositories/journalRepository.ts
export class JournalRepository {
  async createEntry(entry: JournalEntry): Promise<JournalEntry> {
    // PocketBase automatically handles parameterization
    return await this.db.collection('journal_entries').create({
      title: entry.title,
      content: entry.content,
      userId: entry.userId,
      mood: entry.mood,
      isPrivate: entry.isPrivate,
      tags: entry.tags
    });
  }

  async getEntriesByUser(
    userId: string, 
    filters: JournalFilters
  ): Promise<JournalEntry[]> {
    const filterQuery = this.buildFilterQuery(filters);
    
    return await this.db.collection('journal_entries').getList(1, 50, {
      filter: `userId = "${userId}" && ${filterQuery}`,
      sort: '-created'
    });
  }
}
```

### 3. XSS Prevention

**Content Sanitization:**
```typescript
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
    ALLOWED_ATTR: []
  });
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
```

**CSP Headers:**
```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' ws: wss:",
      "frame-ancestors 'none'"
    ].join('; ')
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];

export default {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

## CSRF Protection

### 1. CSRF Token Implementation

```typescript
// lib/csrf.ts
import crypto from 'crypto';

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function verifyCSRFToken(
  token: string, 
  sessionToken: string
): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(token, 'hex'),
    Buffer.from(sessionToken, 'hex')
  );
}

// Middleware
export function csrfProtection(
  req: NextRequest, 
  res: NextResponse, 
  next: NextFunction
) {
  if (req.method === 'GET') {
    return next();
  }

  const token = req.headers.get('x-csrf-token');
  const sessionToken = req.cookies.get('csrf-token')?.value;

  if (!token || !sessionToken || !verifyCSRFToken(token, sessionToken)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }

  next();
}
```

## Rate Limiting

### 1. API Rate Limiting

```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export default function rateLimit(options: Options = {}) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;

        if (isRateLimited) {
          reject(new Error('Rate limit exceeded'));
        } else {
          resolve();
        }
      }),
  };
}

// Usage in API routes
const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Limit each IP to 500 requests per interval
});

export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  
  try {
    await limiter.check(10, ip); // 10 requests per minute
  } catch {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  // Process request...
}
```

## Data Encryption

### 1. Sensitive Data Encryption

```typescript
// lib/encryption.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.ENCRYPTION_KEY!;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, SECRET_KEY);
  cipher.setAAD(Buffer.from('grow-school', 'utf8'));
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export function decrypt(encryptedData: string): string {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipher(ALGORITHM, SECRET_KEY);
  decipher.setAAD(Buffer.from('grow-school', 'utf8'));
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

## File Upload Security

### 1. Secure File Handling

```typescript
// lib/file-upload.ts
import path from 'path';
import { writeFile } from 'fs/promises';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function validateAndSaveFile(
  file: File,
  userId: string
): Promise<{ success: boolean; path?: string; error?: string }> {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: 'File type not allowed' };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'File too large' };
  }

  // Generate safe filename
  const extension = path.extname(file.name);
  const filename = `${userId}_${Date.now()}_${crypto.randomUUID()}${extension}`;
  const filepath = path.join(process.env.UPLOAD_DIR!, filename);

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filepath, buffer);
    
    return { success: true, path: filepath };
  } catch (error) {
    return { success: false, error: 'Failed to save file' };
  }
}
```

## Session Management

### 1. Secure Session Handling

```typescript
// lib/session.ts
import { cookies } from 'next/headers';

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  lastActivity: number;
}

export function createSession(user: User): string {
  const sessionData: SessionData = {
    userId: user.id,
    email: user.email,
    role: user.role,
    lastActivity: Date.now()
  };

  const token = generateToken(sessionData);
  
  // Set secure cookie
  cookies().set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
  });

  return token;
}

export function validateSession(): SessionData | null {
  const sessionCookie = cookies().get('session');
  
  if (!sessionCookie) {
    return null;
  }

  try {
    const sessionData = verifyToken(sessionCookie.value) as SessionData;
    
    // Check if session is expired (24 hours)
    if (Date.now() - sessionData.lastActivity > 24 * 60 * 60 * 1000) {
      destroySession();
      return null;
    }

    return sessionData;
  } catch {
    destroySession();
    return null;
  }
}

export function destroySession(): void {
  cookies().delete('session');
}
```

## Security Monitoring

### 1. Security Event Logging

```typescript
// lib/security-logger.ts
export enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity'
}

export interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  details: Record<string, any>;
}

export function logSecurityEvent(event: SecurityEvent): void {
  console.log('[SECURITY]', JSON.stringify(event));
  
  // In production, send to security monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to external monitoring service
    // e.g., Datadog, Splunk, etc.
  }
}
```

## Compliance & Privacy

### 1. GDPR Compliance

```typescript
// lib/privacy.ts
export interface DataExportRequest {
  userId: string;
  requestedAt: Date;
  status: 'pending' | 'completed' | 'failed';
}

export async function exportUserData(userId: string): Promise<any> {
  const userData = {
    profile: await getUserProfile(userId),
    journalEntries: await getJournalEntries(userId),
    moodData: await getMoodData(userId),
    learningProgress: await getLearningProgress(userId)
  };

  // Remove sensitive internal data
  return sanitizeExportData(userData);
}

export async function deleteUserData(userId: string): Promise<void> {
  // Anonymize or delete user data according to retention policy
  await anonymizeJournalEntries(userId);
  await deleteMoodData(userId);
  await anonymizeLearningData(userId);
  await deleteUserProfile(userId);
}
```

## Security Checklist

### Development
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection implemented
- [ ] CSRF tokens in place
- [ ] Rate limiting configured
- [ ] Secure password hashing
- [ ] JWT token validation
- [ ] File upload restrictions
- [ ] Error handling without information leakage

### Production
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Regular security updates
- [ ] Security monitoring enabled
- [ ] Backup encryption
- [ ] Access logs reviewed
- [ ] Penetration testing completed
- [ ] Compliance requirements met

## Incident Response

### 1. Security Incident Procedure

1. **Detection**: Monitor security logs and alerts
2. **Assessment**: Evaluate the scope and impact
3. **Containment**: Isolate affected systems
4. **Investigation**: Analyze the incident
5. **Recovery**: Restore normal operations
6. **Documentation**: Record lessons learned

### 2. Emergency Contacts

- Security Team: security@growschool.com
- System Administrator: admin@growschool.com
- Legal Team: legal@growschool.com

## Regular Security Tasks

### Daily
- Review security logs
- Monitor failed login attempts
- Check system alerts

### Weekly
- Update dependencies
- Review access permissions
- Backup verification

### Monthly
- Security patch updates
- Access audit
- Penetration testing
- Security training updates

### Quarterly
- Full security assessment
- Policy review
- Compliance audit
- Disaster recovery testing
