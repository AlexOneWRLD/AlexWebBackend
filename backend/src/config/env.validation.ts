import { z } from 'zod';

type Duration = `${number}${'s' | 'm' | 'h' | 'd' | 'w'}`;

export const durationSchema = z
	.string()
	.regex(/^[1-9]\d*(s|m|h|d|w)$/, 'Ожидается формат времени: 15m, 2h, 7d')
	.transform(value => value as Duration);

export const booleanSchema = z.enum(['true', 'false']).transform(value => value === 'true');

export const envSchema = z
	.object({
		NODE_ENV: z.enum(['development', 'test', 'production']),

		APPLICATION_PORT: z.coerce.number().int().min(1).max(65535),

		APPLICATION_URL: z.string().url(),
		ALLOWED_ORIGIN: z.string().url(),

		COOKIES_SECRET: z.string().min(32),

		COOKIE_DOMAIN: z
			.string()
			.optional()
			.transform(value => value?.trim() || undefined),

		SESSION_SECRET: z.string().min(32),
		SESSION_NAME: z.string().min(1),
		SESSION_MAX_AGE: durationSchema,

		SESSION_HTTP_ONLY: booleanSchema,
		SESSION_SECURE: booleanSchema,

		SESSION_FOLDER: z.string().min(1),

		JWT_SECRET: z.string().min(32),
		JWT_ACCESS_TOKEN_TTL: durationSchema,
		JWT_REFRESH_TOKEN_TTL: durationSchema,

		POSTGRES_URL: z.string().startsWith('postgresql://'),

		REDIS_URL: z.string().regex(/^rediss?:\/\//)
	})
	.superRefine((env, ctx) => {
		if (env.NODE_ENV === 'production' && !env.SESSION_SECURE) {
			ctx.addIssue({
				code: 'custom',
				path: ['SESSION_SECURE'],
				message: 'В production SESSION_SECURE должен быть true'
			});
		}

		if (!env.SESSION_HTTP_ONLY) {
			ctx.addIssue({
				code: 'custom',
				path: ['SESSION_HTTP_ONLY'],
				message: 'Для авторизации SESSION_HTTP_ONLY должен быть true'
			});
		}
	});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
	const result = envSchema.safeParse(config);

	if (!result.success) {
		const errors = result.error.issues
			.map(issue => {
				const field = issue.path.join('.');
				return `${field}: ${issue.message}`;
			})
			.join('\n');

		throw new Error(`Ошибки конфигурации окружения:\n${errors}`);
	}

	return result.data;
}
