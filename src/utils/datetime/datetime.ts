import { nextDay, Day, addDays } from 'date-fns';
import { formatInTimeZone, utcToZonedTime } from 'date-fns-tz';

export function getNextWeekDayInterval(
	timezone: string,
	weekDay: Day | number,
): [Date, Date] {
	const today = utcToZonedTime(new Date(), timezone);
	const year = today.getFullYear();
	const month = today.getMonth();
	const date = today.getDate();
	const nextDayValue = nextDay(new Date(year, month, date), weekDay as Day);
	const nextDayPlusDayValue = addDays(nextDayValue, 1);
	return [nextDayValue, nextDayPlusDayValue];
}

export function getFormattedDate(date: Date, timeZone: string): string {
	const formatPattern = "yyyy-MM-dd'T'HH:mm:ssXXX";
	return formatInTimeZone(date, timeZone, formatPattern);
}
