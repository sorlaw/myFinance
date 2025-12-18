import { CurrencyType, UserSettings } from '../entities/UserSettings';

export interface SettingsRepository {
    getSettings(): Promise<UserSettings>;
    setUserName(name: string): Promise<void>;
    setCurrency(currency: CurrencyType): Promise<void>;
}
