import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { API_URL, SINHRON_TOURNAMENT_TYPE_ID } from './chgk.constants';
import { TournamentResponse } from './models/tournament.model';

@Injectable()
export class ChgkService {
	constructor(private readonly httpService: HttpService) { }

	async getTournaments(dateEndBefore: Date | string): Promise<TournamentResponse[]> {
		try {
			const { data } = await lastValueFrom(
				this.httpService.get<TournamentResponse[]>(API_URL.tournaments, {
					params: {
						"dateStart[before]": dateEndBefore,
						"dateEnd[after]": dateEndBefore,
						"type": SINHRON_TOURNAMENT_TYPE_ID
					}
				})
			)

			return data;
		} catch (e) {
			console.log(e)
		}
	}
}
