import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MOSCOW_TIMEZONE } from '../chgk/chgk.constants';
import { ChgkService } from '../chgk/chgk.service';
import { Editor, Tournament } from '../chgk/models/tournament.model';
import { TownResponse } from '../chgk/models/town.model';
import {
	getFormattedDate,
	getNextWeekDayDate,
} from '../utils/datetime/datetime';
import '../utils/telegram/string.extensions'
import { Markup, session, Telegraf } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { Chat, ChatDocument } from './models/chat.model';
import {
	CHAT_IS_NOT_SET,
	CHAT_TYPE_PRIVATE,
	CHOOSE_DAY,
	CHOOSE_NUMBER_OF_TOURNAMENTS,
	CHOOSE_TIME,
	DAY_REGEX,
	INLINE_KEYBOARD_DAYS,
	INLINE_KEYBOARD_NUMBER_OF_TOURNAMENTS,
	INLINE_KEYBOARD_TIME,
	NO_ADMIN_PERMISSION,
	NO_SUCH_TOWN,
	POLL_IS_CREATED_SUCCESSFULLY,
	TELEGRAM_MODULE_OPTIONS,
	TELEGRAM_POLL_MAX_OPTIONS,
	TELEGRAM_POLL_OPTION_MAX_LENGTH,
	TIMEZONE_IS_NOT_PROVIDED,
	TIMEZONE_IS_SET_SUCCESSFULLY,
	TIMEZONE_IS_NOT_SET,
	TIME_REGEX,
	TOURNAMENT_NUMBER_REGEX,
	TOWN_IS_NOT_PROVIDED,
	TOWN_IS_NOT_SET,
	TOWN_IS_SET_SUCCESSFULLY,
} from './telegram.constants';
import { TelegramError } from './telegram.error';
import {
	ITelegramOptions,
	IContext,
	Hideable,
	UpdateContext,
	MatchContext,
} from './telegram.interface';

@Injectable()
export class TelegramService {
	bot: Telegraf<IContext>;
	inlineKeyboardDays: Hideable<InlineKeyboardButton.CallbackButton>[][];
	inlineKeyboardTime: Hideable<InlineKeyboardButton.CallbackButton>[][];
	inlineKeyboardNumberOfTournaments: Hideable<InlineKeyboardButton.CallbackButton>[][];
	private readonly logger = new Logger(TelegramService.name);

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

		this.bot.command('set_town', async (ctx) => {
			try {
				await this.checkIsSenderAdminOrPrivateChat(ctx);
				const [townName, ...args] = this.parseCommandArguments(ctx);
				if (!townName) {
					throw new TelegramError(TOWN_IS_NOT_PROVIDED);
				}
				const towns: TownResponse[] = await this.chgkService.getTownsByName(
					townName,
				);
				if (!towns.length) {
					throw new TelegramError(NO_SUCH_TOWN);
				}
				const townId = towns[0].id;
				this.upsertTownByChatId(ctx.update.message.chat.id, townId);
				this.logger.log(TOWN_IS_SET_SUCCESSFULLY);
				ctx.reply(TOWN_IS_SET_SUCCESSFULLY);
			} catch (error) {
				if (error instanceof TelegramError) {
					ctx.reply(error.message);
				}
				this.logger.error(error.message);
			}
		});

		this.bot.command('set_timezone', async (ctx) => {
			try {
				await this.checkIsSenderAdminOrPrivateChat(ctx);
				const [timeZoneOffset, ...args] = this.parseCommandArguments(ctx);
				if (!timeZoneOffset) {
					throw new TelegramError(TIMEZONE_IS_NOT_PROVIDED);
				}
				const timeZone: string = this.buildTimeZoneString(parseInt(timeZoneOffset));
				this.upsertTimeZoneByChatId(ctx.update.message.chat.id, timeZone);
				this.logger.log(TIMEZONE_IS_SET_SUCCESSFULLY);
				ctx.reply(TIMEZONE_IS_SET_SUCCESSFULLY);
			} catch (error) {
				if (error instanceof TelegramError) {
					ctx.reply(error.message);
				}
				this.logger.error(error.message);
			}
		})

		this.bot.command('create_poll', async (ctx) => {
			try {
				await this.checkIsSenderAdminOrPrivateChat(ctx);
				await this.checkIsChatDataSet(ctx);
				ctx.reply(CHOOSE_DAY, {
					reply_markup: {
						inline_keyboard: this.inlineKeyboardDays,
					},
					reply_to_message_id: ctx.message.message_id,
				});
			} catch (error) {
				if (error instanceof TelegramError) {
					ctx.reply(error.message);
				}
				this.logger.error(error.message);
			}
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
				ctx.session.weekDay = this.parseWeekDayFromReplyKeyboard(ctx);
				await ctx.editMessageText(CHOOSE_TIME);
				await ctx.editMessageReplyMarkup({
					inline_keyboard: this.inlineKeyboardTime,
				});
			} catch (error) {
				if (error instanceof TelegramError) {
					ctx.reply(error.message);
				}
				this.logger.error(error.message);
			}
		});

		this.bot.action(TIME_REGEX, async (ctx) => {
			try {
				ctx.session.hour = this.parseHourFromReplyKeyboard(ctx);
				await ctx.editMessageText(CHOOSE_NUMBER_OF_TOURNAMENTS);
				await ctx.editMessageReplyMarkup({
					inline_keyboard: this.inlineKeyboardNumberOfTournaments,
				});
			} catch (error) {
				if (error instanceof TelegramError) {
					ctx.reply(error.message);
				}
				this.logger.error(error.message);
			}
		});

		this.bot.action(TOURNAMENT_NUMBER_REGEX, async (ctx) => {
			try {
				ctx.session.numberOfTournaments =
					this.parseNumberOfTournamentsFromReplyKeyboard(ctx);
				const chat: Chat = await this.getChatById(ctx.chat.id);
				const { weekDay, hour, numberOfTournaments } = ctx.session;
				const nextWeekDayDate = getNextWeekDayDate(chat.timeZone, weekDay, hour);
				const formattedDate = getFormattedDate(
					nextWeekDayDate,
					MOSCOW_TIMEZONE,
				);
				const tournaments = await this.chgkService.getTournaments(
					formattedDate,
				);
				const notPlayedTournaments = await this.getNotPlayedTournaments(
					tournaments,
					chat.townId,
				);
				const topNotPlayedTournaments =
					this.getTopTournaments(notPlayedTournaments);
				const pollName = this.getPollName(numberOfTournaments);
				ctx.deleteMessage(ctx.update.callback_query.message.message_id);
				await ctx.sendMessage(this.getTournamentsMessage(topNotPlayedTournaments), { parse_mode: 'HTML'});
				await ctx.sendPoll(
					pollName,
					this.getPollingOptions(topNotPlayedTournaments),
					{
						is_anonymous: false,
						allows_multiple_answers: numberOfTournaments > 1,
					},
				);
				ctx.session = undefined;
				this.logger.log(POLL_IS_CREATED_SUCCESSFULLY);
			} catch (error) {
				if (error instanceof TelegramError) {
					ctx.reply(error.message);
				}
				this.logger.error(error.message);
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

	private async upsertTimeZoneByChatId(
		chatId: number,
		timeZone: string
	): Promise<ChatDocument | null> {
		return this.chatModel
			.findOneAndUpdate({ id: chatId }, { timeZone }, { upsert: true })
			.exec();
	}

	private async getChatById(chatId: number): Promise<ChatDocument | null> {
		const chat = this.chatModel.findOne({ id: chatId });
		return chat;
	}

	private parseCommandArguments(ctx: UpdateContext): string[] | null {
		const args: string[] | null = ctx.update.message.text.split(' ')?.slice(1);
		return args;
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
		const options = tournaments.map((tournament: Tournament) => tournament.name);
		return options;
	}

	private getDifficulty(difficulty: number | null) {
		if (difficulty) {
			return difficulty.toFixed(1);
		}
		return '???';
	}

	private getEditorsAsString(editors: Editor[]): string {
		return editors
				.map((editor: Editor) => editor.surname)
				.join(', ');
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

	private async checkIsSenderAdminOrPrivateChat(ctx: IContext): Promise<void> {
		if (ctx.chat.type === CHAT_TYPE_PRIVATE) return;
		const admins = await this.bot.telegram.getChatAdministrators(ctx.chat.id);
		const isSenderAdmin = admins.some((admin) => {
			return admin.user.id === ctx.from.id;
		});
		if (!isSenderAdmin) {
			throw new TelegramError(NO_ADMIN_PERMISSION);
		}
	}

	private async checkIsChatDataSet(ctx: IContext): Promise<void> {
		const chat: Chat = await this.getChatById(ctx.chat.id);
		if (!chat) {
			throw new TelegramError(CHAT_IS_NOT_SET);
		}
		if (!chat?.townId) {
			throw new TelegramError(TOWN_IS_NOT_SET);
		}
		if (!chat?.timeZone) {
			throw new TelegramError(TIMEZONE_IS_NOT_SET);
		}
		ctx.chat['townId'] = chat.townId;
		ctx.chat['timeZone'] = chat.timeZone;
	}

	private parseWeekDayFromReplyKeyboard(ctx: MatchContext): number {
		return parseInt(ctx.match[0].split(' ')[1]);
	}

	private parseHourFromReplyKeyboard(ctx: MatchContext): number {
		return parseInt(ctx.match[0].split(':')[0]);
	}

	private parseNumberOfTournamentsFromReplyKeyboard(ctx: MatchContext): number {
		return parseInt(ctx.match[0]);
	}

	private getTournamentNumberEmoji(tournamentNumber: number): string {
		return ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'].at(tournamentNumber);
	}

	private getTournamentsMessage(tournaments: Tournament[]): string {
		let message = '';
		let tournamentNumber = 1;
		for (const tournament of tournaments) {
			const tournamentName = this.getTournamentNumberEmoji(tournamentNumber++) + ' ' + tournament.name.bold();
			const editors = ('Редакторы: ' + this.getEditorsAsString(tournament.editors)).preformat();
			const questions = 'Вопросы: ' + tournament.questionsCount;
			const difficulty = 'Сложность: ' + this.getDifficulty(tournament?.difficulty);
			const cost = 'Стоимость: ' + tournament.cost;
			const tabulation = '   ';
			message +=
				tournamentName +  
				'\n' + editors +
				'\n' + ([questions, difficulty, cost].join(tabulation)).preformat() +
				'\n\n';
		}

		return message;
	}

	private buildTimeZoneString(offset: number): string {
		const absOffset: number = Math.abs(offset);
		const sign: string = offset >= 0 ? '+' : '-';
		const timeZone = `${sign}${Math.floor(absOffset / 10)}${absOffset % 10}:00`;
		return timeZone;
	}
}
