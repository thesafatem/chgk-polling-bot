import { HttpService } from '@nestjs/axios';
import { ChgkService } from './chgk.service';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';

describe('ChgkService', () => {
	let service: ChgkService;

	const httpService = {
		get: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ChgkService, { provide: HttpService, useValue: httpService }],
		}).compile();

		service = module.get<ChgkService>(ChgkService);
	});

	describe('getTournaments', () => {
		const tournament = {
			id: 1,
			name: 'a',
			longName: 'string',
			lastEditDate: 'string',
			dateStart: new Date(),
			dateEnd: new Date(),
			type: {
				id: 1,
				name: 'a',
			},
			season: 'a',
			idseason: 1,
			orgcommittee: [
				{
					id: 1,
					name: 'a',
					patronymic: 'a',
					surname: 'a',
					dbChgkInfoTag: 'a',
				},
			],
			synchData: {
				dateRequestsAllowedTo: 'string',
				resultFixesTo: 'string',
				resultsRecapsTo: 'string',
				dateAppealAllowedTo: 'string',
				allowAppealCancel: true,
				allowNarratorErrorAppeal: true,
				archive: true,
				dateArchivedAt: 'string',
				dateDownloadQuestionsFrom: 'string',
				dateDownloadQuestionsTo: 'string',
				hideQuestionsTo: 'string',
				hideResultsTo: 'string',
				instantControversial: true,
			},
			mainPayment: 1,
			discountedPaymentReason: 'string',
			currency: 'd',
			editors: [
				{
					id: 1,
					name: 'a',
					patronymic: 'a',
					surname: 'a',
					dbChgkInfoTag: 'a',
				},
			],
			gameJury: [
				{
					id: 1,
					name: 'a',
					patronymic: 'a',
					surname: 'a',
					dbChgkInfoTag: 'a',
				},
			],
			appealJury: [
				{
					id: 1,
					name: 'a',
					patronymic: 'a',
					surname: 'a',
					dbChgkInfoTag: 'a',
				},
			],
			difficultyForecast: 1,
			tournamentInRatingBalanced: true,
			maiiAegis: true,
			maiiAegisUpdatedAt: 'a',
			maiiRating: true,
			maiiRatingUpdatedAt: 'a',
			questionQty: {
				'1': 12,
				'2': 12,
				'3': 12,
			},
		};

		beforeEach(() => {
			httpService.get.mockReturnValue(
				of({
					data: [tournament],
				}),
			);
		});

		it('service is defined', () => {
			expect(service).toBeDefined();
		});

		it('GET tournaments is OK', async () => {
			const response = await service.getTournaments(new Date(), new Date());

			expect(response).toHaveLength(1);
			expect(response[0]).toStrictEqual({
				id: tournament.id,
				name: tournament.name,
				difficulty: tournament.difficultyForecast,
				editors: [
					{
						id: 1,
						surname: 'a',
					},
				],
				maiiAegis: tournament.maiiAegis,
				maiiRating: tournament.maiiRating,
				mainPayment: tournament.mainPayment,
				currency: tournament.currency,
				questionsCount: 36,
			});
		});
	});

	describe('isTournamentPlayedInTown', () => {
		const tournamentRequest = {
			id: 1,
			status: 'string',
			venue: {
				id: 1,
				name: 'string',
				town: {
					id: 1,
					name: 'string',
					region: {
						id: 1,
						name: 'string',
						country: {
							id: 1,
							name: 'string',
						},
					},
					country: {
						id: 1,
						name: 'string',
					},
				},
				type: {
					id: 1,
					name: 'string',
				},
				urls: ['a'],
				address: 'string',
			},
			representative: {
				id: 1,
				name: 'string',
				patronymic: 'string',
				surname: 'string',
				dbChgkInfoTag: 'string',
			},
			narrator: {
				id: 1,
				name: 'string',
				patronymic: 'string',
				surname: 'string',
				dbChgkInfoTag: 'string',
			},
			approximateTeamsCount: 1,
			issuedAt: 'string',
			dateStart: 'string',
			narrators: [
				{
					id: 1,
					name: 'string',
					patronymic: 'string',
					surname: 'string',
					dbChgkInfoTag: 'string',
				},
			],
			tournamentId: 1,
		};

		beforeEach(() => {
			httpService.get.mockReturnValue(of({ data: [tournamentRequest] }));
		});

		it('service is defined', () => {
			expect(service).toBeDefined();
		});

		it('Played in town', async () => {
			const tournamentId = 1;
			const townId = 1;

			const response = await service.isTournamentPlayedInTown(
				tournamentId,
				townId,
			);

			expect(response).toBeTruthy();
		});

		it('Not played in town', async () => {
			const tournamentId = 1;
			const townId = 2;

			const response = await service.isTournamentPlayedInTown(
				tournamentId,
				townId,
			);

			expect(response).toBeFalsy();
		});
	});

	describe('getTownsByName', () => {
		const town = {
			id: 1,
			name: 'Алматы',
			region: {
				id: 1,
				name: 'string',
				country: {
					id: 1,
					name: 'string',
				},
			},
			country: {
				id: 1,
				name: 'string',
			},
		};

		beforeEach(() => {
			httpService.get.mockReturnValue(of({ data: [town] }));
		});

		it('service is defined', () => {
			expect(service).toBeDefined();
		});

		it('Town is found', async () => {
			const townName = 'Алматы';

			const response = await service.getTownsByName(townName);

			expect(response).toStrictEqual([town]);
		});
	});
});
