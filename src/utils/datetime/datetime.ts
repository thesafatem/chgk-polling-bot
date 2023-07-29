import { nextDay, Day, addMilliseconds, hoursToMilliseconds } from 'date-fns';
import {
	formatInTimeZone,
	getTimezoneOffset,
	utcToZonedTime,
} from 'date-fns-tz';

export function getNextWeekDayDate(timezone: string, weekDay: Day | number, hours: number): Date {
	const today = utcToZonedTime(new Date(), timezone);
	const year = today.getFullYear();
	const month = today.getMonth();
	const date = today.getDate();
	const hoursMs = hoursToMilliseconds(hours);
	const offsetMs = getTimezoneOffset(timezone);
	const dateWithHours = addMilliseconds(
		new Date(year, month, date),
		hoursMs - offsetMs,
	);

	const nextDayValue = nextDay(dateWithHours, weekDay as Day);
	return nextDayValue;
}

export function getFormattedDate(date: Date, timeZone: string): string {
	const formatPattern = "yyyy-MM-dd'T'HH:mm:ssXXX";
	return formatInTimeZone(date, timeZone, formatPattern);
}
