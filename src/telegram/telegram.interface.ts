import { ModuleMetadata } from '@nestjs/common';
import { Context, NarrowedContext } from 'telegraf';
import {
	CallbackQuery,
	Message,
	Update,
} from 'telegraf/typings/core/types/typegram';
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

export type Hideable<A> = A & {
	hide: boolean;
};

export type UpdateContext = NarrowedContext<
	IContext,
	{
		message: Update.New & Update.NonChannel & Message.TextMessage;
		update_id: number;
	}
>;

export type MatchContext = NarrowedContext<
	IContext & {
		match: RegExpExecArray;
	},
	Update.CallbackQueryUpdate<CallbackQuery>
>;
