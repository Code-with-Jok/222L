export type RuntimeEnv = NodeJS.ProcessEnv;

export function getRequiredEnv(
  name: string,
  env: RuntimeEnv = process.env,
): string {
  const value = env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getOptionalEnv(
  name: string,
  fallback?: string,
  env: RuntimeEnv = process.env,
): string | undefined {
  return env[name] ?? fallback;
}

export function pickEnv<const Keys extends readonly string[]>(
  keys: Keys,
  env: RuntimeEnv = process.env,
): Record<Keys[number], string | undefined> {
  const values = {} as Record<Keys[number], string | undefined>;

  for (const key of keys) {
    values[key as Keys[number]] = env[key];
  }

  return values;
}
