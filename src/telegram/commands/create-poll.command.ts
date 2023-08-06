import { Telegraf, TelegramError } from "telegraf";
import { Command } from "./command.class";
import { Hideable, IContext } from "../telegram.interface";
import { TelegramService } from "../telegram.service";
import { Logger } from "@nestjs/common";
import { CHOOSE_DAY, INLINE_KEYBOARD_DAYS } from "../telegram.constants";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";

export class CreatePollCommand extends Command {
    inlineKeyboardDays: Hideable<InlineKeyboardButton.CallbackButton>[][];

    constructor(
        bot: Telegraf<IContext>,
        private readonly telegramService: TelegramService,
        private readonly logger: Logger,
    ) {
        super(bot);
        this.inlineKeyboardDays = this.telegramService.getInlineKeyboard(INLINE_KEYBOARD_DAYS);
    }

    handle(): void {
        this.bot.command('create_poll', async (ctx: IContext) => {
            try {
				await this.telegramService.checkIsSenderAdminOrPrivateChat(ctx);
				await this.telegramService.checkIsChatDataSet(ctx);
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
    }
}