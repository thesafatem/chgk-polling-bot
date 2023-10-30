import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { API_URL } from './currency.constants';
import { ConvertResponse } from './models/convert.model';

@Injectable()
export class CurrencyService {
	private readonly token: string;

	constructor(
		private readonly configService: ConfigService,
		private readonly httpService: HttpService,
	) {
		this.token = this.configService.get<string>('CURRENCY_TOKEN');
	}

	async getConversionRate(from: string, to: string): Promise<number> {
		const params = {
			api_key: this.token,
			from,
			to,
		};

		const {
			data: {
				rates: {
					[to]: { rate },
				},
			},
		} = await lastValueFrom(
			this.httpService.get<ConvertResponse>(API_URL.convert, { params }),
		);

		return rate;
	}
}
