import { ModuleMetadata } from '@nestjs/common';
import { Context } from 'telegraf';
export interface ITelegramOptions {
	token: string;
}

export interface ITelegramModuleAsyncOptions
	extends Pick<ModuleMetadata, 'imports'> {
	useFactory: (...args: any[]) => Promise<ITelegramOptions> | ITelegramOptions;
	inject?: any[];
}

interface SessionData {
	weekDay: number;
	hour: number;
	numberOfTournaments: number;
}
export interface IContext extends Context {
	session?: SessionData;
}
