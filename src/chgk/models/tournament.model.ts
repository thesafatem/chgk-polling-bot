export interface TournamentResponse {
	id: number
	name: string
	longName: string
	lastEditDate: string
	dateStart: string
	dateEnd: string
	type: Type
	season: string
	idseason: number
	orgcommittee: User[]
	synchData: SynchData
	mainPayment: number
	discountedPaymentReason: string
	currency: string
	editors: User[]
	gameJury: User[]
	appealJury: User[]
	tournamentInRatingBalanced: boolean
	maiiAegis: boolean
	maiiAegisUpdatedAt: string
	maiiRating: boolean
	maiiRatingUpdatedAt: string
	questionQty: QuestionQty
}

export interface Type {
	id: number
	name: string
}

export interface SynchData {
	dateRequestsAllowedTo: string
	resultFixesTo: string
	resultsRecapsTo: string
	dateAppealAllowedTo: string
	allowAppealCancel: boolean
	allowNarratorErrorAppeal: boolean
	archive: boolean
	dateArchivedAt: string
	dateDownloadQuestionsFrom: string
	dateDownloadQuestionsTo: string
	hideQuestionsTo: string
	hideResultsTo: string
	instantControversial: boolean
}

export interface User {
	id: number
	name: string
	patronymic: string
	surname: string
	dbChgkInfoTag: string
}

export interface QuestionQty {
	"1": number
	"2": number
	"3": number
}
