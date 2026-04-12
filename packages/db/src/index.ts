export type DatabaseProvider = "unconfigured";

export interface DatabaseConfig {
  provider: DatabaseProvider;
  connectionString?: string;
}

export function defineDatabaseConfig(config: DatabaseConfig): DatabaseConfig {
  return config;
}
