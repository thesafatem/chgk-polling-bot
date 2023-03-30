import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { MOSCOW_TIMEZONE } from 'src/chgk/chgk.constants';
import { ChgkService } from 'src/chgk/chgk.service';
import { Editor, Tournament } from 'src/chgk/models/tournament.model';
import {
	getFormattedDate,
	getNextWeekDayDate,
} from 'src/utils/datetime/datetime';
import { WeekDay } from 'src/utils/datetime/datetime.interface';
import { Telegraf } from 'telegraf';
import { TELEGRAM_MODULE_OPTIONS } from './telegram.constants';
import { ITelegramOptions } from './telegram.interface';

@Injectable()
export class TelegramService {
	bot: Telegraf;

	constructor(
		@Inject(TELEGRAM_MODULE_OPTIONS) options: ITelegramOptions,
		private readonly chgkService: ChgkService,
	) {
		this.bot = new Telegraf(options.token);

		this.bot.command('createpoll', async (ctx) => {
			console.dir(ctx.update, { depth: null });
			const text: string = ctx.update.message.text;
			const parsedCommand = text.split(' ');
			const nextWeekDayDate = getNextWeekDayDate(
				parsedCommand[1] as WeekDay,
				Number(parsedCommand[2]),
			);
			const formattedDate = getFormattedDate(nextWeekDayDate, MOSCOW_TIMEZONE);
			const tournaments = await this.chgkService.getTournaments(formattedDate);

			await ctx.sendPoll(
				'Выбираем синхроны',
				this.getPollingOptions(tournaments),
				{
					is_anonymous: false,
					allows_multiple_answers: true,
				},
			);
		});

		this.bot.launch();
	}

	private getPollingOptions(tournaments: Tournament[]): string[] {
		const options = tournaments.map((tournament) =>
			this.prettifyTournamentData(tournament),
		);
		return options;
	}

	private prettifyTournamentData(tournament: Tournament): string {
		const optionWithoutTournamentName =
			'(' +
			this.getPrettifiedEditors(tournament.editors) +
			') ' +
			tournament.questionsCount +
			', ' +
			tournament.difficulty.toFixed(1) +
			', ' +
			tournament.cost;

		const shortenedName = this.getShortenedName(
			tournament.name,
			100 - optionWithoutTournamentName.length,
		);
		return shortenedName + optionWithoutTournamentName;
	}

	private getShortenedName(name: string, symbolsLeft: number): string {
		if (name.length + 1 <= symbolsLeft) return name + ' ';
		const splittedName = name.split(' ');
		let newName = '';
		for (const namePiece of splittedName) {
			if (newName.length + namePiece.length + 1 <= symbolsLeft) {
				newName += namePiece + ' ';
			} else {
				break;
			}
		}
		return newName;
	}

	private getPrettifiedEditors(editors: Editor[]): string {
		const newEditors = editors.map((editor) => editor.surname).join(', ');
		return newEditors;
	}
}
