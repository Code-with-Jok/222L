export type DatabaseProvider = "unconfigured";

export interface DatabaseConfig {
  provider: DatabaseProvider;
  connectionString?: string;
}

export function defineDatabaseConfig(config: DatabaseConfig): DatabaseConfig {
  return config;
}

export { prisma } from "./client.js"; // exports instance of prisma
export * from "@prisma/client"; // exports generated types from prisma
