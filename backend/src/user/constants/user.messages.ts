export const USER_MESSAGES = {
	NOT_FOUND: 'Пользователь не найден',

	NOT_FOUND_OR_DELETED: 'Пользователь не найден или уже удалён',

	LOGIN_TAKEN: 'Этот логин уже занят',

	EMAIL_TAKEN: 'Этот email уже зарегистрирован',

	UNIQUE_CONFLICT: 'Логин или email уже используется',

	UPDATE_EMPTY: 'Не переданы данные для обновления',

	DELETED: 'Пользователь удалён',

	PASSWORD_CHANGED: 'Пароль успешно изменён',

	INVALID_CURRENT_PASSWORD: 'Неверный текущий пароль',

	PASSWORD_MISMATCH: 'Новый пароль и его подтверждение не совпадают',

	PASSWORD_REUSED: 'Новый пароль должен отличаться от текущего',

	PASSWORD_CHANGE_CONFLICT: 'Пароль был изменён другим запросом. Повторите попытку'
} as const;
