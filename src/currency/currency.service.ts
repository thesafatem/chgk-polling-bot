import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { API_URL } from './currency.constants';
import { LatestResponse } from './models/latest.model';

@Injectable()
export class CurrencyService {
    private readonly token: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService
    ) {
        this.token = this.configService.get<string>('CURRENCY_TOKEN');
    }

    async getLatestRate(baseCurrency?: string, currencies?: string[]) {
        try {
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

            return latestResponse.data;
        } catch (error) {
            console.log(error);
        }
    }
}
