import { USER_RULES } from '@/common/constants/user-rules.constants';

export const VALIDATION_MESSAGES = {
	NAME: {
		REQUIRED: 'Имя обязательно для заполнения',
		STRING: 'Имя должно быть строкой',

		MIN_LENGTH: `Имя должно содержать минимум ` + `${USER_RULES.NAME.MIN_LENGTH} символа`,

		MAX_LENGTH: `Имя не должно превышать ` + `${USER_RULES.NAME.MAX_LENGTH} символов`
	},

	LOGIN: {
		REQUIRED: 'Логин обязателен для заполнения',
		STRING: 'Логин должен быть строкой',

		MIN_LENGTH: `Логин должен содержать минимум ` + `${USER_RULES.LOGIN.MIN_LENGTH} символа`,

		MAX_LENGTH: `Логин не должен превышать ` + `${USER_RULES.LOGIN.MAX_LENGTH} символов`,

		FORMAT: 'Логин может содержать только латинские буквы, цифры и _'
	},

	EMAIL: {
		REQUIRED: 'Email обязателен для заполнения',
		STRING: 'Email должен быть строкой',
		FORMAT: 'Некорректный формат email',

		MAX_LENGTH: `Email не должен превышать ` + `${USER_RULES.EMAIL.MAX_LENGTH} символов`
	},

	AGE: {
		REQUIRED: 'Возраст обязателен для заполнения',

		INTEGER: 'Возраст должен быть целым числом',

		MIN: `Минимальный возраст — ${USER_RULES.AGE.MIN}`,

		MAX: `Максимальный возраст — ${USER_RULES.AGE.MAX}`
	},

	DESCRIPTION: {
		REQUIRED: 'Описание обязательно для заполнения',
		STRING: 'Описание должно быть строкой',

		MIN_LENGTH:
			`Описание должно содержать минимум ` + `${USER_RULES.DESCRIPTION.MIN_LENGTH} символа`,

		MAX_LENGTH:
			`Описание не должно превышать ` + `${USER_RULES.DESCRIPTION.MAX_LENGTH} символов`
	},

	PASSWORD: {
		REQUIRED: 'Пароль обязателен для заполнения',
		STRING: 'Пароль должен быть строкой',

		MIN_LENGTH:
			`Пароль должен содержать минимум ` + `${USER_RULES.PASSWORD.MIN_LENGTH} символов`,

		MAX_LENGTH: `Пароль не должен превышать ` + `${USER_RULES.PASSWORD.MAX_LENGTH} символов`,

		MISMATCH: 'Пароли не совпадают'
	}
} as const;
