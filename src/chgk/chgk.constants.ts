export const API_ROOT_URL = 'https://api.rating.chgk.net';
export const API_URL = {
	tournaments: API_ROOT_URL + '/tournaments',
	tournamentRequests: function (tournamentId: number): string {
		return API_ROOT_URL + '/tournaments/' + tournamentId + '/requests';
	},
	towns: API_ROOT_URL + '/towns',
};
export const SINHRON_TOURNAMENT_TYPE_ID = 3;
export const MOSCOW_TIMEZONE = 'Europe/Moscow';
export const ALMATY_TIMEZONE = 'Asia/Almaty';
export const FREE_TOURNAMENT_MESSAGE = '0$';
