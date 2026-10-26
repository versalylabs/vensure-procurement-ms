import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export interface DatabaseCutoverStatus {
  mode: "POSTGRESQL_LIVE" | "LOCAL_PERSISTENT_JSON_FALLBACK";
  postgresConfigured: boolean;
  postgresReachable: boolean;
  schemaModelsCount: number;
  demoAccountEmail: string;
  checkedAt: string;
  message: string;
}

/**
 * Checks whether the configured DATABASE_URL PostgreSQL instance is live and reachable,
 * or if the runtime is operating on the local persistent JSON store (.vensure-local-db.json).
 */
export async function getDatabaseCutoverStatus(): Promise<DatabaseCutoverStatus> {
  const hasUrl = Boolean(process.env.DATABASE_URL);
  if (!hasUrl) {
    return {
      mode: "LOCAL_PERSISTENT_JSON_FALLBACK",
      postgresConfigured: false,
      postgresReachable: false,
      schemaModelsCount: 29,
      demoAccountEmail: "versalylabs@gmail.com",
      checkedAt: new Date().toISOString(),
      message:
        "Running on persistent local JSON store (.vensure-local-db.json). Set DATABASE_URL to cut over to managed PostgreSQL (Neon / Supabase / RDS).",
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      mode: "POSTGRESQL_LIVE",
      postgresConfigured: true,
      postgresReachable: true,
      schemaModelsCount: 29,
      demoAccountEmail: "versalylabs@gmail.com",
      checkedAt: new Date().toISOString(),
      message: "Connected to live PostgreSQL database via PrismaClient.",
    };
  } catch {
    return {
      mode: "LOCAL_PERSISTENT_JSON_FALLBACK",
      postgresConfigured: true,
      postgresReachable: false,
      schemaModelsCount: 29,
      demoAccountEmail: "versalylabs@gmail.com",
      checkedAt: new Date().toISOString(),
      message:
        "DATABASE_URL is configured, but PostgreSQL is currently unreachable; seamlessly serving from local persistent store (.vensure-local-db.json).",
    };
  }
}
