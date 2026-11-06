export const USER_RULES = {
	NAME: {
		MIN_LENGTH: 2,
		MAX_LENGTH: 255
	},

	LOGIN: {
		MIN_LENGTH: 2,
		MAX_LENGTH: 255,
		PATTERN: /^[a-zA-Z0-9_]+$/
	},

	EMAIL: {
		MAX_LENGTH: 320
	},

	AGE: {
		MIN: 1,
		MAX: 120
	},

	DESCRIPTION: {
		MIN_LENGTH: 2,
		MAX_LENGTH: 1000
	},

	PASSWORD: {
		MIN_LENGTH: 6,
		MAX_LENGTH: 255
	}
} as const;
