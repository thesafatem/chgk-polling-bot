import { Telegraf } from "telegraf";
import { Command } from "./command.class";
import { Hideable, IContext, MatchContext } from "../telegram.interface";
import { CHOOSE_TIME, DAY_REGEX, INLINE_KEYBOARD_TIME } from "../telegram.constants";
import { Logger } from "@nestjs/common";
import { TelegramError } from "../telegram.error";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { TelegramService } from "../telegram.service";

export class ChooseDayAction extends Command {
    inlineKeyboardTime: Hideable<InlineKeyboardButton.CallbackButton>[][];

    constructor(
        bot: Telegraf<IContext>,
        private readonly telegramService: TelegramService,
        private readonly logger: Logger,
    ) {
        super(bot);
        this.inlineKeyboardTime = this.telegramService.getInlineKeyboard(INLINE_KEYBOARD_TIME);
    }

    handle(): void {
        this.bot.action(DAY_REGEX, async (ctx: MatchContext) => {
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
    }

    private parseWeekDayFromReplyKeyboard(ctx: MatchContext): number {
		return parseInt(ctx.match[0].split(' ')[1]);
	}
}