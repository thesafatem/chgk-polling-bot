import { Module } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [ConfigModule, HttpModule],
    providers: [CurrencyService],
    exports: [CurrencyService]
})
export class CurrencyModule {}
