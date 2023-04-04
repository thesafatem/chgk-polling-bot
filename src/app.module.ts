import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose/dist';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChgkModule } from './chgk/chgk.module';
import { getMongoConfig } from './configs/mongo.config';
import { getTelegramConfig } from './configs/telegram.config';
import { TelegramModule } from './telegram/telegram.module';

@Module({
	imports: [
		ChgkModule,
		ConfigModule.forRoot(),
		TelegramModule.forRootAsync({
			imports: [ConfigModule, ChgkModule],
			inject: [ConfigService],
			useFactory: getTelegramConfig,
		}),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getMongoConfig,
		}),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
