import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { API_URL } from './chgk.constants';
import { TournamentResponse } from './models/tournament.model';

@Injectable()
export class ChgkService {
	constructor(private readonly httpService: HttpService) { }

	async getTournaments(dateEnd: Date) {
		try {
			const { data } = await lastValueFrom(
				this.httpService.get<TournamentResponse[]>(API_URL.tournaments, {
					params: {
						"dateStart[after]": new Date(),
						"dateEnd[before]": dateEnd
					}
				})
			)

			return data;
		} catch (e) {
			console.log(e)
		}
	}
}
