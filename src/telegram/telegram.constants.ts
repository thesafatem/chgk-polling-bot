export const TELEGRAM_MODULE_OPTIONS = 'TELEGRAM_MODULE_OPTIONS';

export const TELEGRAM_POLL_MAX_OPTIONS = 10;

export const WEEKDAY_IS_NOT_DEFINED = 'Не указан день недели';
export const HOUR_IS_NOT_DEFINED = 'Не указано время';
export const IRREGULAR_WEEKDAY = 'Неверно указан день недели';
export const TOWN_IS_NOT_PROVIDED = 'Не указан город';
export const NO_SUCH_TOWN = 'Неверный город';
export const NO_ADMIN_PERMISSION =
	'Для использования этой функции нужны права администратора';
export const TOWN_IS_NOT_SET = 'Не указан город для этого чата';

export const TOWN_IS_SET_SUCCESSFULLY = 'Город успешно обновлен';
export const CHOOSE_DAY = 'Выберите день';
export const CHOOSE_TIME = 'Выберите время';
export const CHOOSE_NUMBER_OF_TOURNAMENTS = 'Выберите количество синхронов';

export const DAY_REGEX = new RegExp(/week.*/);
export const TIME_REGEX = new RegExp(/^[0-9]{1,2}:\d[0]$/);
export const TOURNAMENT_NUMBER_REGEX = new RegExp(/\d/);

export const INLINE_KEYBOARD_DAYS = [
	[
		{ name: 'Пн', data: 'week 1' },
		{ name: 'Вт', data: 'week 2' },
		{ name: 'Ср', data: 'week 3' },
		{ name: 'Чт', data: 'week 4' },
	],
	[
		{ name: 'Пт', data: 'week 5' },
		{ name: 'Сб', data: 'week 6' },
		{ name: 'Вс', data: 'week 0' },
	],
];
export const INLINE_KEYBOARD_TIME = [
	[
		{ name: '00:00', data: '0:00' },
		{ name: '01:00', data: '1:00' },
		{ name: '02:00', data: '2:00' },
		{ name: '03:00', data: '3:00' },
		{ name: '04:00', data: '4:00' },
		{ name: '05:00', data: '5:00' },
	],
	[
		{ name: '06:00', data: '6:00' },
		{ name: '07:00', data: '7:00' },
		{ name: '08:00', data: '8:00' },
		{ name: '09:00', data: '9:00' },
		{ name: '10:00', data: '10:00' },
		{ name: '11:00', data: '11:00' },
	],
	[
		{ name: '12:00', data: '12:00' },
		{ name: '13:00', data: '13:00' },
		{ name: '14:00', data: '14:00' },
		{ name: '15:00', data: '15:00' },
		{ name: '16:00', data: '16:00' },
		{ name: '17:00', data: '17:00' },
	],
	[
		{ name: '18:00', data: '18:00' },
		{ name: '19:00', data: '19:00' },
		{ name: '20:00', data: '20:00' },
		{ name: '21:00', data: '21:00' },
		{ name: '22:00', data: '22:00' },
		{ name: '23:00', data: '23:00' },
	],
];
export const INLINE_KEYBOARD_NUMBER_OF_TOURNAMENTS = [
	[
		{ name: '1', data: '1' },
		{ name: '2', data: '2' },
		{ name: '3', data: '3' },
	],
];
