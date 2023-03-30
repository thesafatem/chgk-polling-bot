import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChgkModule } from './chgk/chgk.module';
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
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
