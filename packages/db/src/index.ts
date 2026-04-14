export type DatabaseProvider = "unconfigured";

export interface DatabaseConfig {
  provider: DatabaseProvider;
  connectionString?: string;
}

export function defineDatabaseConfig(config: DatabaseConfig): DatabaseConfig {
  return config;
}

export { prisma } from "./client"; // exports instance of prisma
export * from "./generated/client/index.js"; // exports generated types from prisma
