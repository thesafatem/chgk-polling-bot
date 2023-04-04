export interface TournamentRequestResponse {
	id: number;
	status: string;
	venue: Venue;
	representative: User;
	narrator: User;
	approximateTeamsCount: number;
	issuedAt: string;
	dateStart: string;
	narrators: User[];
	tournamentId: number;
}

export interface Venue {
	id: number;
	name: string;
	town: Town;
	type: VenueType;
	urls: string[];
	address?: string;
}

export interface Town {
	id: number;
	name: string;
	region?: Region;
	country: Country;
}

export interface Region {
	id: number;
	name: string;
	country: Country;
}

export interface Country {
	id: number;
	name: string;
}

export interface VenueType {
	id: number;
	name: string;
}

export interface User {
	id: number;
	name: string;
	patronymic: string;
	surname: string;
	dbChgkInfoTag?: string;
}
