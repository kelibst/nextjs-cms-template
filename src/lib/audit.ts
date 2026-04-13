import { db, auditLogs } from '@/lib/db'

export type AuditAction =
  | 'auth.login.success'
  | 'auth.login.failed'
  | 'auth.logout'
  | 'auth.password_reset.requested'
  | 'auth.password_reset.completed'
  | 'payment.initialized'
  | 'payment.verified'
  | 'media.deleted'
  | 'fund.reviewed'
  | 'admin.content.published'

interface AuditOptions {
  userId?: string | null
  action: AuditAction
  metadata?: Record<string, unknown>
  ipAddress?: string | null
  userAgent?: string | null
}

export async function audit(options: AuditOptions): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId: options.userId ?? null,
      action: options.action,
      metadata: options.metadata ?? null,
      ipAddress: options.ipAddress ?? null,
      userAgent: options.userAgent ?? null,
    })
  } catch {
    // Audit logging must never break the main flow
    console.error('[audit] failed to write log:', options.action)
  }
}
