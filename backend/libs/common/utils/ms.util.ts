export function ms(timeString: string): number {
	// Регулярное выражение: ищет число (включая дробные) и буквы после него
	const match = timeString.trim().match(/^(\d+(?:\.\d+)?)\s*([a-zA-Zа-яА-Я]+)$/);

	if (!match) {
		throw new Error('Неверный формат строки времени');
	}

	const value = parseFloat(match[1]);
	const unit = match[2].toLowerCase();

	switch (unit) {
		// Миллисекунды
		case 'ms':
		case 'millisecond':
		case 'milliseconds':
		case 'мс':
		case 'миллисекунда':
		case 'миллисекунды':
			return value;

		// Секунды
		case 's':
		case 'sec':
		case 'second':
		case 'seconds':
		case 'с':
		case 'сек':
		case 'секунда':
		case 'секунды':
			return value * 1000;

		// Минуты
		case 'm':
		case 'min':
		case 'minute':
		case 'minutes':
		case 'м':
		case 'мин':
		case 'минута':
		case 'минуты':
			return value * 60000;

		// Часы
		case 'h':
		case 'hr':
		case 'hour':
		case 'hours':
		case 'ч':
		case 'час':
		case 'часа':
		case 'часов':
			return value * 3600000;

		// Дни
		case 'd':
		case 'day':
		case 'days':
		case 'д':
		case 'день':
		case 'дня':
		case 'дней':
			return value * 86400000;

		// Неизвестный тип
		default:
			throw new Error(`Неизвестная единица измерения: ${unit}`);
	}
}
