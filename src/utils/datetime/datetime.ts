import {
	nextMonday,
	nextDay,
	nextFriday,
	nextSaturday,
	nextSunday,
	nextThursday,
	nextTuesday,
	nextWednesday,
	addHours,
	startOfDay,
	getDay,
} from 'date-fns';
import { format } from 'date-fns-tz';
import { WeekDay } from './datetime.interface';

export function getNextWeekDayDate(weekDay: WeekDay, hours: number): Date {
	const today = addHours(startOfDay(new Date()), hours);
	switch (weekDay) {
		case WeekDay.Monday:
			return nextMonday(today);
		case WeekDay.Tuesday:
			return nextTuesday(today);
		case WeekDay.Wednesday:
			return nextWednesday(today);
		case WeekDay.Thursday:
			return nextThursday(today);
		case WeekDay.Friday:
			return nextFriday(today);
		case WeekDay.Saturday:
			return nextSaturday(today);
		case WeekDay.Sunday:
			return nextSunday(today);
		default:
			return nextDay(today, getDay(today));
	}
}

export function getFormattedDate(date: Date, timeZone: string): string {
	const formatPattern = "yyyy-MM-dd'T'HH:mm:ssXXX";
	return format(date, formatPattern, { timeZone });
}
