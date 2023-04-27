import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MOSCOW_TIMEZONE } from 'src/chgk/chgk.constants';
import { ChgkService } from 'src/chgk/chgk.service';
import { Editor, Tournament } from 'src/chgk/models/tournament.model';
import { TownResponse } from 'src/chgk/models/town.model';
import {
	getFormattedDate,
	getNextWeekDayDate,
} from 'src/utils/datetime/datetime';
import { Markup, session, Telegraf } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { Chat, ChatDocument } from './models/chat.model';
import {
	CHOOSE_DAY,
	CHOOSE_NUMBER_OF_TOURNAMENTS,
	CHOOSE_TIME,
	DAY_REGEX,
	INLINE_KEYBOARD_DAYS,
	INLINE_KEYBOARD_NUMBER_OF_TOURNAMENTS,
	INLINE_KEYBOARD_TIME,
	NO_SUCH_TOWN,
	TELEGRAM_MODULE_OPTIONS,
	TELEGRAM_POLL_MAX_OPTIONS,
	TIME_REGEX,
	TOURNAMENT_NUMBER_REGEX,
	TOWN_IS_NOT_PROVIDED,
	TOWN_IS_SET_SUCCESSFULLY,
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
		@InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
		private readonly chgkService: ChgkService,
	) {
		this.inlineKeyboardDays = this.getInlineKeyboard(INLINE_KEYBOARD_DAYS);
		this.inlineKeyboardTime = this.getInlineKeyboard(INLINE_KEYBOARD_TIME);
		this.inlineKeyboardNumberOfTournaments = this.getInlineKeyboard(
			INLINE_KEYBOARD_NUMBER_OF_TOURNAMENTS,
		);

		this.bot = new Telegraf<IContext>(options.token);
		this.bot.use(session());

		this.bot.command('settown', async (ctx) => {
			try {
				const townName: string | null = ctx.update.message.text.split(' ')?.[1];
				if (!townName) {
					ctx.reply(TOWN_IS_NOT_PROVIDED);
					return;
				}
				const towns: TownResponse[] = await this.chgkService.getTownsByName(
					townName,
				);
				if (!towns.length) {
					ctx.reply(NO_SUCH_TOWN);
					return;
				}
				const townId = towns[0].id;
				this.upsertTownByChatId(ctx.update.message.chat.id, townId);
				ctx.reply(TOWN_IS_SET_SUCCESSFULLY);
			} catch (error) {}
		});

		this.bot.command('createpoll', async (ctx) => {
			try {
				ctx.reply(CHOOSE_DAY, {
					reply_markup: {
						inline_keyboard: this.inlineKeyboardDays,
					},
					reply_to_message_id: ctx.message.message_id,
				});
			} catch (error) {}
		});

		this.bot.action(DAY_REGEX, async (ctx) => {
			try {
				if (!ctx.session) {
					ctx.session = {
						weekDay: 0,
						hour: 0,
						numberOfTournaments: 0,
					};
				}
				ctx.session.weekDay = Number(ctx.match[0].split(' ')[1]);
				await ctx.editMessageText(CHOOSE_TIME);
				await ctx.editMessageReplyMarkup({
					inline_keyboard: this.inlineKeyboardTime,
				});
			} catch (error) {}
		});

		this.bot.action(TIME_REGEX, async (ctx) => {
			try {
				ctx.session.hour = Number(ctx.match[0].split(':')[0]);
				await ctx.editMessageText(CHOOSE_NUMBER_OF_TOURNAMENTS);
				await ctx.editMessageReplyMarkup({
					inline_keyboard: this.inlineKeyboardNumberOfTournaments,
				});
			} catch (error) {}
		});

		this.bot.action(TOURNAMENT_NUMBER_REGEX, async (ctx) => {
			try {
				ctx.session.numberOfTournaments = Number(ctx.match[0]);
				const { weekDay, hour, numberOfTournaments } = ctx.session;
				const nextWeekDayDate = getNextWeekDayDate(weekDay, hour);
				const formattedDate = getFormattedDate(
					nextWeekDayDate,
					MOSCOW_TIMEZONE,
				);
				const tournaments = await this.chgkService.getTournaments(
					formattedDate,
				);
				const { townId } = await this.getChatById(ctx.chat.id);
				const notPlayedTournaments = await this.getNotPlayedTournaments(
					tournaments,
					townId,
				);
				const topNotPlayedTournaments =
					this.getTopTournaments(notPlayedTournaments);
				const pollName = this.getPollName(numberOfTournaments);
				await ctx.sendPoll(
					pollName,
					this.getPollingOptions(topNotPlayedTournaments),
					{
						is_anonymous: false,
						allows_multiple_answers: numberOfTournaments > 1,
					},
				);
				ctx.session = undefined;
			} catch (error) {
				console.log(error);
			}
		});

		this.bot.launch();
	}

	private async upsertTownByChatId(
		chatId: number,
		townId: number,
	): Promise<ChatDocument | null> {
		return this.chatModel
			.findOneAndUpdate({ id: chatId }, { townId }, { upsert: true })
			.exec();
	}

	private async getChatById(chatId: number): Promise<ChatDocument | null> {
		const chat = this.chatModel.findOne({ id: chatId });
		return chat;
	}

	private async getNotPlayedTournaments(
		tournaments: Tournament[],
		townId: number,
	): Promise<Tournament[]> {
		const isTournamentPlayed = async (tournament: Tournament) => {
			const isPlayed = await this.chgkService.isTournamentPlayedInTown(
				tournament.id,
				townId,
			);
			return isPlayed;
		};

		const isPlayedArray = await Promise.all(
			tournaments.map(isTournamentPlayed),
		);

		const notPlayedTournaments = tournaments.filter(
			(_, index) => !isPlayedArray[index],
		);

		return notPlayedTournaments;
	}

	private getTopTournaments(tournaments: Tournament[]): Tournament[] {
		const compareByDifficultyDesc = (
			tournamentA: Tournament,
			tournamentB: Tournament,
		): -1 | 0 | 1 => {
			if (tournamentA?.difficulty === null) return 1;
			if (tournamentB?.difficulty === null) return -1;
			if (tournamentA.difficulty === tournamentB.difficulty) return 0;
			if (tournamentA.difficulty < tournamentB.difficulty) return 1;
			return -1;
		};

		tournaments.sort(compareByDifficultyDesc);
		return tournaments.slice(0, TELEGRAM_POLL_MAX_OPTIONS);
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
			this.getDifficulty(tournament?.difficulty) +
			', ' +
			tournament.cost;

		const shortenedName = this.getShortenedName(
			tournament.name,
			100 - optionWithoutTournamentName.length,
		);
		if ((shortenedName + optionWithoutTournamentName).length > 100) {
			console.log(tournament, shortenedName, optionWithoutTournamentName);
		}
		return shortenedName + optionWithoutTournamentName;
	}

	private getDifficulty(difficulty: number | null) {
		if (difficulty) {
			return difficulty.toFixed(1);
		}
		return '???';
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
		const topThreeEditors: string[] = editors
			.slice(0, 3)
			.map((editor) => editor.surname);
		if (editors.length > 3) {
			topThreeEditors.push('...');
		}
		return topThreeEditors.join(', ');
	}

	private getTournamentDeclension(numberOfTournaments: number): string {
		switch (numberOfTournaments) {
			case 1:
				return 'синхрон';
			case 2:
			case 3:
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
