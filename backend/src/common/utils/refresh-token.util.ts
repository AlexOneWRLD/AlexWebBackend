import { createHash, timingSafeEqual } from 'node:crypto';

export function hashRefreshToken(token: string): string {
	return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function matchesRefreshToken(token: string, storedHash: string): boolean {
	const actualHash = Buffer.from(hashRefreshToken(token), 'hex');

	const expectedHash = Buffer.from(storedHash, 'hex');

	if (actualHash.length !== expectedHash.length) {
		return false;
	}

	return timingSafeEqual(actualHash, expectedHash);
}
