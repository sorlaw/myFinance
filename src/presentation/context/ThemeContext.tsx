import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'system',
    setTheme: () => { },
    toggleTheme: () => { },
    isDark: false,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const { colorScheme, setColorScheme } = useColorScheme();
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved theme on mount
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('user_theme');
                if (savedTheme) {
                    setColorScheme(savedTheme as Theme);
                }
            } catch (e) {
                console.error("Failed to load theme", e);
            } finally {
                setIsLoaded(true);
            }
        };
        loadTheme();
    }, []);

    // Persist theme whenever it changes (but only after initial load)
    useEffect(() => {
        if (!isLoaded) return;
        const saveTheme = async () => {
            try {
                await AsyncStorage.setItem('user_theme', colorScheme ?? 'system');
            } catch (e) {
                console.error("Failed to save theme", e);
            }
        };
        saveTheme();
    }, [colorScheme, isLoaded]);

    const toggleTheme = () => {
        const newTheme = colorScheme === 'dark' ? 'light' : 'dark';
        setColorScheme(newTheme);
    };

    const setTheme = (theme: Theme) => {
        setColorScheme(theme);
    };

    return (
        <ThemeContext.Provider
            value={{
                theme: (colorScheme as Theme) || 'system',
                setTheme,
                toggleTheme,
                isDark: colorScheme === 'dark'
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};
