import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class Chat {
	@Prop({ unique: true })
	id: number;

	@Prop()
	townId: number;

	@Prop()
	timeZone: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

export type ChatDocument = HydratedDocument<Chat>;
