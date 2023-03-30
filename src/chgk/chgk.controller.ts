import {
	Controller,
	Get,
	Query,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { ChgkService } from './chgk.service';
import {
	FindTournamentsQueryDto,
	WeekDay,
} from './dto/find-tournaments.query.dto';
import {
	addHours,
	getDay,
	nextDay,
	nextFriday,
	nextMonday,
	nextSaturday,
	nextSunday,
	nextThursday,
	nextTuesday,
	nextWednesday,
	startOfDay,
} from 'date-fns';
import { format } from 'date-fns-tz';
import { MOSCOW_TIMEZONE, TIMEZONE_DIFFERENCE } from './chgk.constants';

@Controller('chgk')
export class ChgkController {
	constructor(private readonly chgkService: ChgkService) {}

	@Get('/')
	async get(
		@Query(
			new ValidationPipe({
				transform: true,
				transformOptions: { enableImplicitConversion: true },
				forbidNonWhitelisted: true,
			}),
		)
		dto: FindTournamentsQueryDto,
	) {
		const nextWeekDayDate = this.getNextWeekDayDate(dto.weekDay, dto.hours);
		const formattedNextWeekDayDate = this.getFormattedDate(nextWeekDayDate);
		const tournaments = await this.chgkService.getTournaments(
			formattedNextWeekDayDate,
		);
		return tournaments;
	}

	@UsePipes(new ValidationPipe())
	async check(dto: FindTournamentsQueryDto) {
		const nextWeekDayDate = this.getNextWeekDayDate(dto.weekDay, dto.hours);
		const formattedNextWeekDayDate = this.getFormattedDate(nextWeekDayDate);
		const tournaments = await this.chgkService.getTournaments(
			formattedNextWeekDayDate,
		);
		return tournaments;
	}

	private getNextWeekDayDate(weekDay: WeekDay, hours: number): Date {
		const today = addHours(startOfDay(new Date()), hours + TIMEZONE_DIFFERENCE);
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

	private getFormattedDate(date: Date): string {
		const formatPattern = "yyyy-MM-dd'T'HH:mm:ssXXX";
		return format(date, formatPattern, { timeZone: MOSCOW_TIMEZONE });
	}
}
