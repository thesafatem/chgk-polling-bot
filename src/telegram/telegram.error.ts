export class TelegramError extends Error {
	constructor();
	constructor(message: string);
	constructor(message?: string) {
		if (typeof message !== 'undefined') {
			super(message);
			return;
		}
		super();
	}
}
