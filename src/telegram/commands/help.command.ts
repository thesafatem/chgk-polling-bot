import { Telegraf } from "telegraf";
import { Command } from "./command.class";
import { IContext } from "../telegram.interface";

export class HelpCommandBot extends Command {
    constructor(bot: Telegraf<IContext>) {
        super(bot);
    }

    handle(): void {
        this.bot.help(async (ctx: IContext) => {
            ctx.reply('help');
        })
    }
}