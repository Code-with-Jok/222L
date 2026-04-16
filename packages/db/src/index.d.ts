export type DatabaseProvider =
  | "unconfigured"
  | "postgresql"
  | "mysql"
  | "sqlite"
  | "sqlserver"
  | "cockroachdb"
  | "mongodb";

export type DatabaseConfig =
  | { provider: "unconfigured"; connectionString?: never }
  | {
      provider: Exclude<DatabaseProvider, "unconfigured">;
      connectionString: string;
    };
export declare function defineDatabaseConfig(
  config: DatabaseConfig
): DatabaseConfig;
export { prisma } from "./client.js";
export * from "./generated/client/index.js";
//# sourceMappingURL=index.d.ts.map
