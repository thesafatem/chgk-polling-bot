import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Markup } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { Chat, ChatDocument } from './models/chat.model';
import {
	CHAT_IS_NOT_SET,
	CHAT_TYPE_PRIVATE,
	NO_ADMIN_PERMISSION,
	TIMEZONE_IS_NOT_SET,
	TOWN_IS_NOT_SET,
} from './telegram.constants';
import { TelegramError } from './telegram.error';
import {
	IContext,
	Hideable,
	UpdateContext,
} from './telegram.interface';

@Injectable()
export class TelegramService {
	constructor(
		@InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
	) {}

	async upsertTownByChatId(
		chatId: number,
		townId: number,
	): Promise<ChatDocument | null> {
		return this.chatModel
			.findOneAndUpdate({ id: chatId }, { townId }, { upsert: true })
			.exec();
	}

	async upsertTimeZoneByChatId(
		chatId: number,
		timeZone: string
	): Promise<ChatDocument | null> {
		return this.chatModel
			.findOneAndUpdate({ id: chatId }, { timeZone }, { upsert: true })
			.exec();
	}

	async upsertCurrencyByChatId(
		chatId: number,
		currency: string
	): Promise<ChatDocument | null> {
		return this.chatModel
			.findOneAndUpdate({ id: chatId }, { currency }, { upsert: true })
			.exec();
	}

	async getChatById(chatId: number): Promise<ChatDocument | null> {
		const chat = this.chatModel.findOne({ id: chatId });
		return chat;
	}

	parseCommandArguments(ctx: UpdateContext): string[] | null {
		const args: string[] | null = ctx.update.message.text.split(' ')?.slice(1);
		return args;
	}

	getInlineKeyboard(
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

	async checkIsSenderAdminOrPrivateChat(ctx: IContext): Promise<void> {
		if (ctx.chat.type === CHAT_TYPE_PRIVATE) return;
		const admins = await ctx.getChatAdministrators();
		const isSenderAdmin = admins.some((admin) => {
			return admin.user.id === ctx.from.id;
		});
		if (!isSenderAdmin) {
			throw new TelegramError(NO_ADMIN_PERMISSION);
		}
	}

	async checkIsChatDataSet(ctx: IContext): Promise<void> {
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
		ctx.chat['currency'] = chat.currency;
	}
}
