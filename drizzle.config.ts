import type { Config } from 'drizzle-kit';

export default {
    schema: './src/data/datasources/local/schema.ts',
    out: './drizzle',
    dialect: 'sqlite',
    driver: 'expo',
} satisfies Config;
