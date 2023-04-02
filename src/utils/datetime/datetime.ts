import { nextDay, addHours, startOfDay, Day } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export function getNextWeekDayDate(weekDay: Day | number, hours: number): Date {
	const today = addHours(startOfDay(new Date()), hours);
	const nextDayValue = nextDay(today, weekDay as Day);
	return nextDayValue;
}

export function getFormattedDate(date: Date, timeZone: string): string {
	const formatPattern = "yyyy-MM-dd'T'HH:mm:ssXXX";
	return formatInTimeZone(date, timeZone, formatPattern);
}
