import { Inject, Injectable, Logger, type OnApplicationShutdown } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import Redis from 'ioredis';
import { redisConfig } from '@/config/redis.config';

@Injectable()
export class RedisService implements OnApplicationShutdown {
	private readonly logger = new Logger(RedisService.name);

	public readonly client: Redis;

	public constructor(
		@Inject(redisConfig.KEY)
		config: ConfigType<typeof redisConfig>
	) {
		this.client = new Redis(config.url, {
			connectTimeout: 5000,
			maxRetriesPerRequest: 1
		});

		this.client.on('ready', () => {
			this.logger.log('Redis подключён');
		});

		this.client.on('error', (error: Error) => {
			this.logger.error(`Ошибка подключения к Redis: ${error.message}`, error.stack);
		});
	}

	public async onApplicationShutdown(signal?: string): Promise<void> {
		this.logger.log(`Закрытие Redis. Причина: ${signal ?? 'app.close()'}`);

		if (this.client.status === 'end') {
			return;
		}

		if (this.client.status !== 'ready') {
			this.client.disconnect();
			return;
		}

		try {
			await this.client.quit();

			this.logger.log('Соединение Redis закрыто');
		} catch (error: unknown) {
			this.client.disconnect();

			this.logger.error(
				'Ошибка при закрытии Redis',
				error instanceof Error ? error.stack : String(error)
			);
		}
	}
}
