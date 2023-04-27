export interface TownResponse {
	id: number;
	name: string;
	region: Region;
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
