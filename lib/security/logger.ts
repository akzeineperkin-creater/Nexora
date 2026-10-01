/**
 * Security Audit Logger
 * Provides structured, PII-sanitized security event logging for Nexora.
 * Masks tokens, passwords, and sensitive identifiers to prevent log leakage.
 */

export type SecurityEventType =
  | 'IDOR_ATTEMPT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'TURNSTILE_FAILED'
  | 'TURNSTILE_VERIFIED'
  | 'UNAUTHORIZED_ACCESS'
  | 'ACCESS_DENIED'
  | 'AUTH_FAILURE'
  | 'AUTH_SUCCESS'
  | 'INPUT_VALIDATION_FAILED'
  | 'SECURITY_CONFIG_NOTICE';

export interface SecurityEventData {
  event: SecurityEventType;
  endpoint: string;
  method?: string;
  ip?: string;
  userId?: string | null;
  targetId?: string | null;
  details?: Record<string, any>;
  severity?: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
}

function sanitizeIp(ip?: string): string {
  if (!ip) return 'unknown';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.*.*`;
  }
  return ip.slice(0, 8) + '...';
}

function sanitizeData(obj: Record<string, any>): Record<string, any> {
  const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'cookie', 'turnstile', 'key'];
  const sanitized: Record<string, any> = {};

  for (const [k, v] of Object.entries(obj)) {
    const lowerKey = k.toLowerCase();
    if (sensitiveKeys.some((s) => lowerKey.includes(s))) {
      sanitized[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      sanitized[k] = sanitizeData(v);
    } else {
      sanitized[k] = v;
    }
  }

  return sanitized;
}

export function logSecurityEvent(eventData: SecurityEventData): void {
  const {
    event,
    endpoint,
    method = 'GET',
    ip,
    userId,
    targetId,
    details = {},
    severity = 'WARN',
  } = eventData;

  const payload = {
    timestamp: new Date().toISOString(),
    system: 'NexoraSecurityAudit',
    event,
    severity,
    endpoint,
    method,
    clientIp: sanitizeIp(ip),
    userId: userId ? `${userId.slice(0, 8)}...` : 'anonymous',
    targetId: targetId ? `${targetId.slice(0, 8)}...` : undefined,
    details: sanitizeData(details),
  };

  const formatted = JSON.stringify(payload);

  if (severity === 'CRITICAL' || severity === 'ERROR') {
    console.error(`[SECURITY_ALERT] ${formatted}`);
  } else if (severity === 'WARN') {
    console.warn(`[SECURITY_WARN] ${formatted}`);
  } else {
    console.info(`[SECURITY_INFO] ${formatted}`);
  }
}
