import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { MOSCOW_TIMEZONE } from 'src/chgk/chgk.constants';
import { ChgkService } from 'src/chgk/chgk.service';
import { Editor, Tournament } from 'src/chgk/models/tournament.model';
import {
	getFormattedDate,
	getNextWeekDayDate,
} from 'src/utils/datetime/datetime';
import { Markup, session, Telegraf } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import {
	DAY_REGEX,
	INLINE_KEYBOARD_DAYS,
	INLINE_KEYBOARD_NUMBER_OF_TOURNAMENTS,
	INLINE_KEYBOARD_TIME,
	TELEGRAM_MODULE_OPTIONS,
	TIME_REGEX,
	TOURNAMENT_NUMBER_REGEX,
} from './telegram.constants';
import { ITelegramOptions, IContext } from './telegram.interface';

type Hideable<A> = A & {
	hide: boolean;
};

@Injectable()
export class TelegramService {
	bot: Telegraf<IContext>;
	inlineKeyboardDays: Hideable<InlineKeyboardButton.CallbackButton>[][];
	inlineKeyboardTime: Hideable<InlineKeyboardButton.CallbackButton>[][];
	inlineKeyboardNumberOfTournaments: Hideable<InlineKeyboardButton.CallbackButton>[][];

	constructor(
		@Inject(TELEGRAM_MODULE_OPTIONS) options: ITelegramOptions,
		private readonly chgkService: ChgkService,
	) {
		this.inlineKeyboardDays = this.getInlineKeyboard(INLINE_KEYBOARD_DAYS);
		this.inlineKeyboardTime = this.getInlineKeyboard(INLINE_KEYBOARD_TIME);
		this.inlineKeyboardNumberOfTournaments = this.getInlineKeyboard(
			INLINE_KEYBOARD_NUMBER_OF_TOURNAMENTS,
		);

		this.bot = new Telegraf<IContext>(options.token);
		this.bot.use(session());

		this.bot.command('createpoll', async (ctx) => {
			ctx.reply('Выберите день', {
				reply_markup: {
					inline_keyboard: this.inlineKeyboardDays,
				},
				reply_to_message_id: ctx.message.message_id,
			});
		});

		this.bot.action(DAY_REGEX, async (ctx) => {
			if (!ctx.session) {
				ctx.session = {
					weekDay: 0,
					hour: 0,
					numberOfTournaments: 0,
				};
			}
			ctx.session.weekDay = Number(ctx.match[0].split(' ')[1]);
			await ctx.editMessageText('Выберите время');
			await ctx.editMessageReplyMarkup({
				inline_keyboard: this.inlineKeyboardTime,
			});
		});

		this.bot.action(TIME_REGEX, async (ctx) => {
			ctx.session.hour = Number(ctx.match[0].split(':')[0]);
			await ctx.editMessageText('Выберите количество синхронов');
			await ctx.editMessageReplyMarkup({
				inline_keyboard: this.inlineKeyboardNumberOfTournaments,
			});
		});

		this.bot.action(TOURNAMENT_NUMBER_REGEX, async (ctx) => {
			ctx.session.numberOfTournaments = Number(ctx.match[0]);
			const { weekDay, hour, numberOfTournaments } = ctx.session;
			const nextWeekDayDate = getNextWeekDayDate(weekDay, hour);
			const formattedDate = getFormattedDate(nextWeekDayDate, MOSCOW_TIMEZONE);
			const tournaments = await this.chgkService.getTournaments(formattedDate);
			console.log(tournaments);
			// tournaments.filter(tournament => {
			// 	return !chgkService.isTournamentPlayedInTown(tournamentId)
			// })
			const pollName = this.getPollName(numberOfTournaments);
			await ctx.sendPoll(pollName, this.getPollingOptions(tournaments), {
				is_anonymous: false,
				allows_multiple_answers: numberOfTournaments > 1,
			});
			ctx.session = undefined;
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

	private getTournamentDeclension(numberOfTournaments: number): string {
		switch (numberOfTournaments) {
			case 1:
				return 'синхрон';
			case 2 || 3:
				return 'синхрона';
		}
	}

	private getPollName(numberOfTournaments: number): string {
		return (
			'Выбираем ' +
			numberOfTournaments +
			' ' +
			this.getTournamentDeclension(numberOfTournaments)
		);
	}

	private getInlineKeyboard(
		inlineKeyboard2DArray: { name: string; data: string }[][],
	): Hideable<InlineKeyboardButton.CallbackButton>[][] {
		const inlineKeyboard = inlineKeyboard2DArray.map((inlineKeyboardRow) => {
			const inlineKeyboardButtonRow = inlineKeyboardRow.map(
				(inlineKeyboardElement) => {
					return Markup.button.callback(
						inlineKeyboardElement.name,
						inlineKeyboardElement.data,
					);
				},
			);
			return inlineKeyboardButtonRow;
		});
		return inlineKeyboard;
	}
}
