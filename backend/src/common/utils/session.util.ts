import type { Request } from 'express';

function normalizeError(error: unknown): Error {
	if (error instanceof Error) {
		return error;
	}

	if (typeof error === 'string') {
		return new Error(error);
	}

	return new Error('Неизвестная ошибка сессии');
}

export function regenerateSession(req: Request): Promise<void> {
	return new Promise((resolve, reject) => {
		req.session.regenerate(err => {
			if (err) {
				return reject(normalizeError(err));
			}

			resolve();
		});
	});
}

export function saveSession(req: Request): Promise<void> {
	return new Promise((resolve, reject) => {
		req.session.save(error => {
			if (error) {
				reject(normalizeError(error));
				return;
			}

			resolve();
		});
	});
}

export function destroySession(req: Request): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		req.session.destroy(err => (err ? reject(normalizeError(err)) : resolve()));
	});
}
