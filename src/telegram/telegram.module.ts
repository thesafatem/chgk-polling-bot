import { DynamicModule, Provider } from '@nestjs/common';
import { TELEGRAM_MODULE_OPTIONS } from './telegram.constants';
import { ITelegramModuleAsyncOptions } from './telegram.interface';
import { TelegramService } from './telegram.service';
import { TelegramBot } from './telegram.bot';

export class TelegramModule {
	static forRootAsync(options: ITelegramModuleAsyncOptions): DynamicModule {
		const asyncOptions = this.createAsyncOptionsProvider(options);
		return {
			module: TelegramModule,
			imports: options.imports,
			providers: [asyncOptions, TelegramBot, TelegramService],
			exports: [TelegramBot],
		};
	}

	private static createAsyncOptionsProvider(
		options: ITelegramModuleAsyncOptions,
	): Provider {
		return {
			provide: TELEGRAM_MODULE_OPTIONS,
			useFactory: async (...args: any[]) => {
				const config = await options.useFactory(...args);
				return config;
			},
			inject: options.inject || [],
		};
	}
}
