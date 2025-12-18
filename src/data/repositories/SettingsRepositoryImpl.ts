import AsyncStorage from '@react-native-async-storage/async-storage';
import { CurrencyType, UserSettings } from '../../core/entities/UserSettings';
import { SettingsRepository } from '../../core/repositories/SettingsRepository';

const KEYS = {
    USER_NAME: 'user_name',
    USER_CURRENCY: 'user_currency',
};

export class SettingsRepositoryImpl implements SettingsRepository {
    async getSettings(): Promise<UserSettings> {
        const [name, currency] = await Promise.all([
            AsyncStorage.getItem(KEYS.USER_NAME),
            AsyncStorage.getItem(KEYS.USER_CURRENCY),
        ]);

        return {
            userName: name,
            currency: (currency as CurrencyType) || 'IDR',
        };
    }

    async setUserName(name: string): Promise<void> {
        await AsyncStorage.setItem(KEYS.USER_NAME, name);
    }

    async setCurrency(currency: CurrencyType): Promise<void> {
        await AsyncStorage.setItem(KEYS.USER_CURRENCY, currency);
    }
}
