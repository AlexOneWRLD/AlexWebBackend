export const AUTH_MESSAGES = {
	INVALID_CREDENTIALS: 'Неверный логин или пароль',

	NOT_AUTHENTICATED: 'Пользователь не вошёл в систему',

	USER_NOT_AVAILABLE: 'Пользователь не найден или удалён',

	INVALID_REFRESH_TOKEN: 'Недействительный refresh-токен',

	EXPIRED_REFRESH_TOKEN: 'Refresh-токен повреждён или просрочен',

	INVALID_TOKEN_TYPE: 'Неверный тип токена',

	SESSION_MISMATCH: 'Сессия не соответствует токену',

	SESSION_EXPIRED: 'Сессия истекла. Войдите заново',

	LOGOUT_SUCCESS: 'Выход выполнен'
} as const;
