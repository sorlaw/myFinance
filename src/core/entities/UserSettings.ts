export type CurrencyType = 'IDR' | 'USD';

export interface UserSettings {
    userName: string | null;
    currency: CurrencyType;
    // Add other settings here as needed (e.g. theme)
}
