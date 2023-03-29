import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, Max, Min } from 'class-validator';

export enum WeekDay {
	Monday = 'пн',
	Tuesday = 'вт',
	Wednesday = 'ср',
	Thursday = 'чт',
	Friday = 'пт',
	Saturday = 'сб',
	Sunday = 'вс',
}

export class FindTournamentsQueryDto {
	@IsEnum(WeekDay)
	@Transform(({ value }) => value.toLowerCase())
	weekDay: WeekDay;

	@IsNumber()
	@Max(24)
	@Min(0)
	hours: number;
}
