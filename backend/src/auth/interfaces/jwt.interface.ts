export interface JwtPayload {
	id: string;
	type: 'access_token' | 'refresh_token';
}
