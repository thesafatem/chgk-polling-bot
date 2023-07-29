import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import {
	API_URL,
	FREE_TOURNAMENT_MESSAGE,
	RUSSIAN_LANGUAGE_ID,
	SINHRON_TOURNAMENT_TYPE_ID,
} from './chgk.constants';
import { TournamentRequestResponse } from './models/tournament-requests.model';
import {
	Currency,
	CurrencySign,
	Editor,
	QuestionQty,
	Tournament,
	TournamentResponse,
	User,
} from './models/tournament.model';
import { TownResponse } from './models/town.model';

@Injectable()
export class ChgkService {
	constructor(private readonly httpService: HttpService) {}

	async getTournaments(dateEndAfter: Date | string): Promise<Tournament[]> {
		try {
			const { data: tournaments } = await lastValueFrom(
				this.httpService.get<TournamentResponse[]>(API_URL.tournaments, {
					params: {
						'dateStart[before]': dateEndAfter,
						'dateEnd[after]': dateEndAfter,
						type: SINHRON_TOURNAMENT_TYPE_ID,
						languages: RUSSIAN_LANGUAGE_ID
					},
				}),
			);

			const parsedTournaments: Tournament[] =
				this.parseTournaments(tournaments);

			return parsedTournaments;
		} catch (e) {
			console.log(e);
		}
	}

	async getTournamentRequests(
		tournamentId: number,
	): Promise<TournamentRequestResponse[]> {
		const { data: tournamentRequests } = await lastValueFrom(
			this.httpService.get<TournamentRequestResponse[]>(
				API_URL.tournamentRequests(tournamentId),
				{
					params: {
						pagination: false,
					},
				},
			),
		);

		return tournamentRequests;
	}

	async getTownsByName(townName: string): Promise<TownResponse[]> {
		const { data: towns } = await lastValueFrom(
			this.httpService.get<TownResponse[]>(API_URL.towns, {
				params: {
					name: townName,
				},
			}),
		);

		return towns;
	}

	async isTournamentPlayedInTown(
		tournamentId: number,
		townId: number,
	): Promise<boolean> {
		const tournamentRequests: TournamentRequestResponse[] =
			await this.getTournamentRequests(tournamentId);

		const found = tournamentRequests.some((request) => {
			return request.venue.town.id == townId;
		});

		return found;
	}

	private parseTournaments(tournaments: TournamentResponse[]): Tournament[] {
		const parsedTournaments = tournaments.map((tournament) => {
			const editors: Editor[] = this.parseEditors(tournament.editors);
			const cost: string = this.parseCost(
				tournament.mainPayment,
				tournament.currency,
			);
			const questionsCount: number = this.parseQuestionsCount(
				tournament.questionQty,
			);

			return {
				id: tournament.id,
				name: tournament.name,
				difficulty: tournament.difficultyForecast,
				editors,
				cost,
				questionsCount,
			};
		});
		return parsedTournaments;
	}

	private parseEditors(editors: User[]): Editor[] {
		const parsedEditors = editors.map((editor) => {
			return {
				id: editor.id,
				surname: editor.surname,
			};
		});
		return parsedEditors;
	}

	private parseCost(mainPayment: number, currency: Currency): string {
		if (mainPayment === 0) {
			return FREE_TOURNAMENT_MESSAGE;
		}
		return mainPayment + this.getCurrencySign(currency);
	}

	private parseQuestionsCount(questionQty: QuestionQty): number {
		let count = 0;
		for (const key in questionQty) {
			count += questionQty[key];
		}
		return count;
	}

	private getCurrencySign(currency: Currency): CurrencySign {
		const currencyKey =
			Object.keys(Currency)[Object.values(Currency).indexOf(currency)];
		return CurrencySign[currencyKey];
	}
}
