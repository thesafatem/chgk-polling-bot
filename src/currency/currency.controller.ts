import { Controller, Logger, OnModuleInit } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CURRENCY_CHGK_API_TO_CODE_MAPPING } from './currency.constants';
import { Cron } from '@nestjs/schedule';

@Controller('currency')
export class CurrencyController implements OnModuleInit {
	private readonly logger: Logger = new Logger(CurrencyController.name);

	constructor(private readonly currencyService: CurrencyService) {}
	onModuleInit() {
		// throw new Error('Method not implemented.');
	}

	// onModuleInit() {
	// 	this.updateLatestCurrenciesRates();
	// }

	// @Cron('0 */12 * * *')
	// async updateLatestCurrenciesRates(): Promise<void> {
	// 	try {
	// 		const latestRates = await Promise.all(
	// 			Object.values(CURRENCY_CHGK_API_TO_CODE_MAPPING).map((base) => {
	// 				console.log('DABOODEE');
	// 				return this.currencyService.getLatestRate(base);
	// 			}),
	// 		);

	// 		latestRates.forEach((latestRate) => {
	// 			this.currencyService.updateByBaseCurrency(latestRate);
	// 		});
	// 	} catch (e) {
	// 		console.error(e);
	// 		if (e?.response?.status === 429) {
	// 			this.logger.error(e?.response?.data?.message);
	// 		}
	// 	}
	// }
}
