import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { API_URL } from './currency.constants';
import { ConvertResponse } from './models/convert.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CurrencyService {
	private readonly token: string;

	constructor(
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		private readonly configService: ConfigService,
		private readonly httpService: HttpService,
	) {
		this.token = this.configService.get<string>('CURRENCY_TOKEN');
	}

	async getConversionRate(from: string, to: string): Promise<number> {
		const cacheKey = from + '-' + to;
		const cachedRate = await this.cacheManager.get<number>(cacheKey);
		if (cachedRate) {
			console.log('YOOHOO');
			return cachedRate;
		}

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

		this.cacheManager.set(cacheKey, rate, 60 * 60 * 12);

		return rate;
	}
}
