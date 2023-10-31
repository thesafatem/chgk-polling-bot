import { Module } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CurrencyController } from './currency.controller';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
	imports: [ConfigModule, HttpModule, CacheModule.register()],
	providers: [CurrencyService],
	exports: [CurrencyService],
	controllers: [CurrencyController],
})
export class CurrencyModule {}
