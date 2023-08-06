import { Telegraf } from "telegraf";
import { Command } from "./command.class";
import { IContext, UpdateContext } from "../telegram.interface";
import { Logger } from "@nestjs/common";
import { TelegramService } from "../telegram.service";
import { TelegramError } from "../telegram.error";
import { TIMEZONE_IS_NOT_PROVIDED, TIMEZONE_IS_SET_SUCCESSFULLY } from "../telegram.constants";

export class SetTimezoneCommand extends Command {
    constructor(
        bot: Telegraf<IContext>,
        private readonly telegramService: TelegramService,
        private readonly logger: Logger
    ) {
        super(bot);
    }

    handle(): void {
        this.bot.command('set_timezone', async (ctx: UpdateContext) => {
            try {
				await this.telegramService.checkIsSenderAdminOrPrivateChat(ctx);
				const [timeZoneOffset, ...args] = this.telegramService.parseCommandArguments(ctx);
				if (!timeZoneOffset) {
					throw new TelegramError(TIMEZONE_IS_NOT_PROVIDED);
				}
				const timeZone: string = this.buildTimeZoneString(parseInt(timeZoneOffset));
				this.telegramService.upsertTimeZoneByChatId(ctx.update.message.chat.id, timeZone);
				this.logger.log(TIMEZONE_IS_SET_SUCCESSFULLY);
				ctx.reply(TIMEZONE_IS_SET_SUCCESSFULLY);
			} catch (error) {
				if (error instanceof TelegramError) {
					ctx.reply(error.message);
				}
				this.logger.error(error.message);
			}
        });
    }

    private buildTimeZoneString(offset: number): string {
		const absOffset: number = Math.abs(offset);
		const sign: string = offset >= 0 ? '+' : '-';
		const timeZone = `${sign}${Math.floor(absOffset / 10)}${absOffset % 10}:00`;
		return timeZone;
	}
}