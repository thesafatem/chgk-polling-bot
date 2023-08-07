import { Telegraf } from "telegraf";
import { Command } from "./command.class";
import { Hideable, IContext } from "../telegram.interface";
import { Logger } from "@nestjs/common";
import { TelegramService } from "../telegram.service";
import { TelegramError } from "../telegram.error";
import { CHOOSE_CURRENCY, INLINE_KEYBOARD_CURRENCIES } from "../telegram.constants";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";

export class SetCurrencyCommand extends Command {
    inlineKeyboardCurrencies: Hideable<InlineKeyboardButton.CallbackButton>[][];

    constructor(
        bot: Telegraf<IContext>,
        private readonly telegramService: TelegramService,
        private readonly logger: Logger
    ) {
        super(bot);
        this.inlineKeyboardCurrencies = this.telegramService.getInlineKeyboard(INLINE_KEYBOARD_CURRENCIES);
    }

    handle(): void {
        this.bot.command('set_currency', async (ctx: IContext) => {
            try {
				await this.telegramService.checkIsSenderAdminOrPrivateChat(ctx);
				ctx.reply(CHOOSE_CURRENCY, {
					reply_markup: {
						inline_keyboard: this.inlineKeyboardCurrencies,
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