import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';

@Schema({_id: false})
export class CurrencyRate {
    @Prop()
    code: string;

    @Prop()
    value: number;
}

export const CurrencyRateSchema = SchemaFactory.createForClass(CurrencyRate);

@Schema({ timestamps: true })
export class Currency {
	@Prop()
	baseCurrency: string;

	@Prop({type: MSchema.Types.Mixed})
	rates: Record<string, CurrencyRate>;
}

export const CurrencySchema = SchemaFactory.createForClass(Currency);

export type CurrencyDocument = HydratedDocument<Currency>;
