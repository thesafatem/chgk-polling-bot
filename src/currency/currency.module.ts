import { Module } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CurrencyController } from './currency.controller';

@Module({
	imports: [ConfigModule, HttpModule],
	providers: [CurrencyService],
	exports: [CurrencyService],
	controllers: [CurrencyController],
})
export class CurrencyModule {}
