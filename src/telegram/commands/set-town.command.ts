import { Telegraf } from "telegraf";
import { Command } from "./command.class";
import { IContext, UpdateContext } from "../telegram.interface";
import { TelegramService } from "../telegram.service";
import { ChgkService } from "src/chgk/chgk.service";
import { NO_SUCH_TOWN, TOWN_IS_NOT_PROVIDED, TOWN_IS_SET_SUCCESSFULLY } from "../telegram.constants";
import { TownResponse } from "src/chgk/models/town.model";
import { TelegramError } from "../telegram.error";
import { Logger } from "@nestjs/common";

export class SetTownCommand extends Command {
    constructor(
        bot: Telegraf<IContext>,
        private readonly chgkService: ChgkService,
        private readonly telegramService: TelegramService,
        private readonly logger: Logger
    ) {
        super(bot);
    }

    handle(): void {
        this.bot.command('set_town', async (ctx: UpdateContext) => {
            try {
				await this.telegramService.checkIsSenderAdminOrPrivateChat(ctx);
				const [townName, ...args] = this.telegramService.parseCommandArguments(ctx);
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
				this.telegramService.upsertTownByChatId(ctx.update.message.chat.id, townId);
				this.logger.log(TOWN_IS_SET_SUCCESSFULLY);
				ctx.reply(TOWN_IS_SET_SUCCESSFULLY);
			} catch (error) {
				if (error instanceof TelegramError) {
					ctx.reply(error.message);
				}
				this.logger.error(error.message);
			}
        });
    }
}