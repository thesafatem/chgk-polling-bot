export interface ConvertResponse {
	success: boolean;
	updated_date: Date;
	base_currency_code: string;
	base_currency_name: string;
	amount: number;
	rates: {
		[key: string]: {
			currency_name: string;
			rate: number;
			rate_for_amount: number;
		};
	};
}
