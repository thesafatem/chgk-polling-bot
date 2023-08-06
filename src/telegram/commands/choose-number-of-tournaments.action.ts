import { Telegraf } from "telegraf";
import { Command } from "./command.class";
import { IContext, MatchContext } from "../telegram.interface";
import { POLL_IS_CREATED_SUCCESSFULLY, TELEGRAM_POLL_MAX_OPTIONS, TOURNAMENT_NUMBER_REGEX } from "../telegram.constants";
import { Logger } from "@nestjs/common";
import { TelegramError } from "../telegram.error";
import { TelegramService } from "../telegram.service";
import { Chat } from "../models/chat.model";
import { getFormattedDate, getNextWeekDayDate } from "src/utils/datetime/datetime";
import { MOSCOW_TIMEZONE } from "src/chgk/chgk.constants";
import { ChgkService } from "src/chgk/chgk.service";
import { Editor, Tournament } from "src/chgk/models/tournament.model";
import '../../utils/telegram/string.extensions'

export class ChooseNumberOfTournamentsAction extends Command {
    constructor(
        bot: Telegraf<IContext>,
        private readonly chgkService: ChgkService,
        private readonly telegramService: TelegramService,
        private readonly logger: Logger,
    ) {
        super(bot);
    }

    handle(): void {
        this.bot.action(TOURNAMENT_NUMBER_REGEX, async (ctx: MatchContext) => {
            try {
				ctx.session.numberOfTournaments =
					this.parseNumberOfTournamentsFromReplyKeyboard(ctx);
				const chat: Chat = await this.telegramService.getChatById(ctx.chat.id);
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
    }

    private parseNumberOfTournamentsFromReplyKeyboard(ctx: MatchContext): number {
		return parseInt(ctx.match[0]);
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

    private getTournamentNumberEmoji(tournamentNumber: number): string {
		return ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'].at(tournamentNumber);
	}

    private getEditorsAsString(editors: Editor[]): string {
		return editors
				.map((editor: Editor) => editor.surname)
				.join(', ');
	}

    private getDifficulty(difficulty: number | null) {
		if (difficulty) {
			return difficulty.toFixed(1);
		}
		return '???';
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
            const aegis = 'Эгида МАИИ: ' + (tournament.maiiAegis ? '✅' : '🚫');
            const rating = 'Рейтингуется: ' + (tournament.maiiRating ? '✅' : '🚫');
			const tabulation = '   ';
			message +=
				tournamentName +  
				'\n' + editors +
				'\n' + ([questions, difficulty, cost].join(tabulation)).preformat() +
                '\n' + ([aegis, rating].join(tabulation)).preformat() + 
				'\n\n';
		}

		return message;
	}

    private getPollingOptions(tournaments: Tournament[]): string[] {
		const options = tournaments.map((tournament: Tournament) => tournament.name);
		return options;
	}
}