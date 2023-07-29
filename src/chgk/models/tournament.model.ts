export interface TournamentResponse {
	id: number;
	name: string;
	longName: string;
	lastEditDate: string;
	dateStart: string;
	dateEnd: string;
	type: Type;
	season: string;
	idseason: number;
	orgcommittee: User[];
	synchData: SynchData;
	mainPayment: number;
	discountedPaymentReason: string;
	currency: Currency;
	editors: User[];
	gameJury: User[];
	appealJury: User[];
	difficultyForecast: number;
	tournamentInRatingBalanced: boolean;
	maiiAegis: boolean;
	maiiAegisUpdatedAt: string;
	maiiRating: boolean;
	maiiRatingUpdatedAt: string;
	questionQty: QuestionQty;
	languages: Language[];
}

export interface Type {
	id: number;
	name: string;
}

export interface SynchData {
	dateRequestsAllowedTo: string;
	resultFixesTo: string;
	resultsRecapsTo: string;
	dateAppealAllowedTo: string;
	allowAppealCancel: boolean;
	allowNarratorErrorAppeal: boolean;
	archive: boolean;
	dateArchivedAt: string;
	dateDownloadQuestionsFrom: string;
	dateDownloadQuestionsTo: string;
	hideQuestionsTo: string;
	hideResultsTo: string;
	instantControversial: boolean;
}

export interface User {
	id: number;
	name: string;
	patronymic: string;
	surname: string;
	dbChgkInfoTag: string;
}

export interface QuestionQty {
	[key: string]: number;
}

export interface Language {
	id: string;
	name: string;
}

export enum Currency {
	EUR = 'e',
	RUB = 'r',
	USD = 'd',
	UAH = 'u',
}

export enum CurrencySign {
	EUR = '€',
	RUB = '₽',
	USD = '$',
	UAH = '₴',
}

export interface Tournament {
	id: number;
	name: string;
	editors: Editor[];
	difficulty: number;
	cost: string;
	questionsCount: number;
}
export interface Editor {
	id: number;
	surname: string;
}
