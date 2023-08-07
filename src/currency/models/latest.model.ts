export interface LatestResponse {
    meta: {
        last_updated_at: Date;
    };
    data: {
        [key: string]: CurrencyRate
    }
}

export interface CurrencyRate {
    code: string;
    value: number;
}