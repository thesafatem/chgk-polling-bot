import { Telegraf } from "telegraf";
import { Command } from "./command.class";
import { Hideable, IContext, MatchContext } from "../telegram.interface";
import { CHOOSE_NUMBER_OF_TOURNAMENTS, INLINE_KEYBOARD_NUMBER_OF_TOURNAMENTS, TIME_REGEX } from "../telegram.constants";
import { Logger } from "@nestjs/common";
import { TelegramError } from "../telegram.error";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { TelegramService } from "../telegram.service";

export class ChooseTimeAction extends Command {
    inlineKeyboardNumberOfTournaments: Hideable<InlineKeyboardButton.CallbackButton>[][];

    constructor(
        bot: Telegraf<IContext>,
        private readonly telegramService: TelegramService,
        private readonly logger: Logger,
    ) {
        super(bot);
        this.inlineKeyboardNumberOfTournaments = this.telegramService.getInlineKeyboard(
			INLINE_KEYBOARD_NUMBER_OF_TOURNAMENTS,
		);;
    }

    handle(): void {
        this.bot.action(TIME_REGEX, async (ctx: MatchContext) => {
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
    }

    private parseHourFromReplyKeyboard(ctx: MatchContext): number {
		return parseInt(ctx.match[0].split(':')[0]);
	}
}