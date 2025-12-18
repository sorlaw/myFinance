import React, { createContext, useContext, useEffect, useState } from 'react';
import { CurrencyType } from '../../core/entities/UserSettings';
import { SettingsRepositoryImpl } from '../../data/repositories/SettingsRepositoryImpl';

interface CurrencyContextType {
    currency: CurrencyType;
    setCurrency: (currency: CurrencyType) => Promise<void>;
    formatCurrency: (amount: number) => string;
    symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);
const settingsRepository = new SettingsRepositoryImpl();

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
    const [currency, setCurrencyState] = useState<CurrencyType>('IDR');

    useEffect(() => {
        // Load saved currency on mount
        const loadSettings = async () => {
            const settings = await settingsRepository.getSettings();
            setCurrencyState(settings.currency);
        };
        loadSettings();
    }, []);

    const setCurrency = async (newCurrency: CurrencyType) => {
        try {
            await settingsRepository.setCurrency(newCurrency);
            setCurrencyState(newCurrency);
        } catch (e) {
            console.error("Failed to set currency", e);
        }
    };

    const symbol = currency === 'IDR' ? 'Rp' : '$';

    const formatCurrency = (amount: number) => {
        if (currency === 'IDR') {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
            }).format(amount);
        } else {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
            }).format(amount);
        }
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, symbol }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
