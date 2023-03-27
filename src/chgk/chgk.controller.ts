import { Controller, Get } from '@nestjs/common';
import { ChgkService } from './chgk.service';

@Controller('chgk')
export class ChgkController {
	constructor(private readonly chgkService: ChgkService) { }

	@Get('/get')
	async get() {
		const weekAfter = new Date();
		weekAfter.setDate(weekAfter.getDate() + 7);
		const res = await this.chgkService.getTournaments(weekAfter);
		return res;
	}
}
