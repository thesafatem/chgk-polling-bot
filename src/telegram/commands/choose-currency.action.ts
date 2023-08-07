import { Telegraf } from "telegraf";
import { Command } from "./command.class";
import { IContext, MatchContext } from "../telegram.interface";
import { CURRENCIES, CURRENCY_IS_SET_SUCCESSFULLY } from "../telegram.constants";
import { Logger } from "@nestjs/common";
import { TelegramError } from "../telegram.error";
import { TelegramService } from "../telegram.service";

export class ChooseCurrencyAction extends Command {
    constructor(
        bot: Telegraf<IContext>,
        private readonly telegramService: TelegramService,
        private readonly logger: Logger,
    ) {
        super(bot);
    }

    handle(): void {
        this.bot.action(CURRENCIES, async (ctx: MatchContext) => {
            try {
				const currency = this.parseCurrencyFromReplyKeyboard(ctx);
                this.telegramService.upsertCurrencyByChatId(ctx.chat.id, currency);
                ctx.deleteMessage(ctx.update.callback_query.message.message_id);
                ctx.reply(CURRENCY_IS_SET_SUCCESSFULLY);
			} catch (error) {
				if (error instanceof TelegramError) {
					ctx.reply(error.message);
				}
				this.logger.error(error.message);
			}
        });
    }

    private parseCurrencyFromReplyKeyboard(ctx: MatchContext): string {
		return ctx.match[0];
	}
}