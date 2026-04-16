export type DatabaseProvider = "unconfigured";
export interface DatabaseConfig {
    provider: DatabaseProvider;
    connectionString?: string;
}
export declare function defineDatabaseConfig(config: DatabaseConfig): DatabaseConfig;
export { prisma } from "./client.js";
export * from "./generated/client/index.js";
//# sourceMappingURL=index.d.ts.map