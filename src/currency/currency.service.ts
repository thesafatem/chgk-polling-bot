import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { API_URL } from './currency.constants';
import { LatestRate, LatestResponse } from './models/latest.model';
import { Currency, CurrencyDocument } from './models/currency.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CurrencyService {
    private readonly token: string;

    constructor(
        @InjectModel(Currency.name) private currencyModel: Model<CurrencyDocument>,
        private readonly configService: ConfigService,
        private readonly httpService: HttpService
    ) {
        this.token = this.configService.get<string>('CURRENCY_TOKEN');
    }

    async getLatestRate(baseCurrency?: string, currencies?: string[]): Promise<LatestRate> {
        const params = {
            apikey: this.token,
        }
        if (baseCurrency) {
            params['base_currency'] = baseCurrency;
        }
        if (currencies) {
            params['currencies'] = currencies;
        }

        const { data: latestResponse } = await lastValueFrom(
            this.httpService.get<LatestResponse>(API_URL.latest, { params })
        );

        return {
            rates: latestResponse.data,
            baseCurrency: baseCurrency ?? 'USD'
        }
    }

    async updateByBaseCurrency({baseCurrency, rates}: LatestRate): Promise<CurrencyDocument> {
        return this.currencyModel.findOneAndUpdate(
            { baseCurrency },
            { rates },
            { upsert: true }
        ).exec();
    }

    async getLatestRateOfTwoCurrencies(baseCurrency: string, targetCurrency: string): Promise<number> {
        const { rates: { [targetCurrency]: { value } } } = await this.currencyModel.findOne(
            { baseCurrency },
            {
                rates: {
                    [targetCurrency]: 1
                }
            }
        ).exec();
        
        return value;
    }
}
