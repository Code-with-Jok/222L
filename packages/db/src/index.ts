export type DatabaseProvider = "postgres" | "mysql" | "sqlite" | "unconfigured";

export interface DatabaseConfig {
  provider: DatabaseProvider;
  connectionString?: string;
}

export function defineDatabaseConfig(config: DatabaseConfig): DatabaseConfig {
  return config;
}

export * from "@prisma/client";
export { prisma } from "./client.js";
