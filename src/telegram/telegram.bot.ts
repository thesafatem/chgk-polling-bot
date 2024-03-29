import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { ChgkService } from '../chgk/chgk.service';
import { TELEGRAM_MODULE_OPTIONS } from './telegram.constants';
import { ITelegramOptions, IContext } from './telegram.interface';
import { Command } from './commands/command.class';
import { CreatePollCommand } from './commands/create-poll.command';
import { HelpCommandBot } from './commands/help.command';
import { SetTownCommand } from './commands/set-town.command';
import { TelegramService } from './telegram.service';
import { Telegraf, session } from 'telegraf';
import { SetTimezoneCommand } from './commands/set-timezone.command';
import { ChooseDayAction } from './commands/choose-day.action';
import { ChooseNumberOfTournamentsAction } from './commands/choose-number-of-tournaments.action';
import { SetCurrencyCommand } from './commands/set-currency.command';
import { ChooseCurrencyAction } from './commands/choose-currency.action';
import { CurrencyService } from 'src/currency/currency.service';

@Injectable()
export class TelegramBot {
	private readonly bot: Telegraf<IContext>;
	private readonly logger = new Logger(TelegramBot.name);
	commands: Command[] = [];

	constructor(
		@Inject(TELEGRAM_MODULE_OPTIONS) options: ITelegramOptions,
		private readonly chgkService: ChgkService,
		private readonly telegramService: TelegramService,
		private readonly currencyService: CurrencyService,
	) {
		this.bot = new Telegraf<IContext>(options.token);
		this.bot.use(session());
		this.commands = [
			new HelpCommandBot(this.bot),
			new SetTownCommand(
				this.bot,
				this.chgkService,
				this.telegramService,
				this.logger,
			),
			new SetTimezoneCommand(this.bot, this.telegramService, this.logger),
			new SetCurrencyCommand(this.bot, this.telegramService, this.logger),
			new ChooseCurrencyAction(this.bot, this.telegramService, this.logger),
			new CreatePollCommand(this.bot, this.telegramService, this.logger),
			new ChooseDayAction(this.bot, this.telegramService, this.logger),
			new ChooseNumberOfTournamentsAction(
				this.bot,
				this.chgkService,
				this.telegramService,
				this.currencyService,
				this.logger,
			),
		];
		for (const command of this.commands) {
			command.handle();
		}
		this.bot.launch();
	}
}
