import { Module } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CurrencyController } from './currency.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Currency, CurrencySchema } from './models/currency.model';

@Module({
    imports: [
        ConfigModule, HttpModule,
        MongooseModule.forFeature([
            {
				name: Currency.name,
				schema: CurrencySchema,
			},
        ])
    ],
    providers: [CurrencyService],
    exports: [CurrencyService],
    controllers: [CurrencyController]
})
export class CurrencyModule {}
