import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export interface AuditLogInput {
  organizationId: string;
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Records an immutable audit trail event for any procurement lifecycle mutation.
 */
export async function logAuditEvent(input: AuditLogInput) {
  return prisma.auditLog.create({
    data: {
      organizationId: input.organizationId,
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });
}
