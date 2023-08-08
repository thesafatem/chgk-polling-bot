import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose/dist';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChgkModule } from './chgk/chgk.module';
import { getMongoConfig } from './configs/mongo.config';
import { getTelegramConfig } from './configs/telegram.config';
import { TelegramModule } from './telegram/telegram.module';
import { Chat, ChatSchema } from './telegram/models/chat.model';
import { CurrencyModule } from './currency/currency.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
	imports: [
		ChgkModule,
		CurrencyModule,
		ConfigModule.forRoot(),
		TelegramModule.forRootAsync({
			imports: [
				ConfigModule, ChgkModule, CurrencyModule,
				MongooseModule.forFeature([
					{
						name: Chat.name,
						schema: ChatSchema,
					},
				]),
			],
			inject: [ConfigService],
			useFactory: getTelegramConfig,
		}),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getMongoConfig,
		}),
		ScheduleModule.forRoot(),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
