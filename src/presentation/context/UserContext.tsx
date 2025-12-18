import React, { createContext, useContext, useEffect, useState } from 'react';
import { SettingsRepositoryImpl } from '../../data/repositories/SettingsRepositoryImpl';

interface UserContextType {
    userName: string | null;
    setUserName: (name: string) => Promise<void>;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const settingsRepository = new SettingsRepositoryImpl();

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [userName, setUserNameState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await settingsRepository.getSettings();
                setUserNameState(settings.userName);
            } catch (e) {
                console.error("Failed to load user settings", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadSettings();
    }, []);

    const setUserName = async (name: string) => {
        try {
            await settingsRepository.setUserName(name);
            setUserNameState(name);
        } catch (e) {
            console.error("Failed to set user name", e);
            throw e;
        }
    };

    return (
        <UserContext.Provider value={{ userName, setUserName, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
