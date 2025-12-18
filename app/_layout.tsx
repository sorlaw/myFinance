import { Stack } from 'expo-router';
import { useEffect } from 'react';
import 'react-native-gesture-handler';
import Animated, { interpolateColor, useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';
import '../global.css';

import { expoDb } from '@/src/data/datasources/local/database';


export const unstable_settings = {
  anchor: '(tabs)',
};

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { CurrencyProvider } from '@/src/presentation/context/CurrencyContext';
import { ThemeProvider, useTheme } from '@/src/presentation/context/ThemeContext';
import { UserProvider } from '@/src/presentation/context/UserContext';

const LayoutContent = () => {
  const { isDark } = useTheme();

  const progress = useDerivedValue(() => {
    return isDark ? withTiming(1, { duration: 500 }) : withTiming(0, { duration: 500 });
  }, [isDark]);

  const rStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ['#ffffff', '#111827'] // white, gray-900
    );

    return { backgroundColor };
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Animated.View style={[{ flex: 1 }, rStyle]}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" />
          <Stack.Screen
            name="add"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="transactions"
            options={{
              presentation: 'modal',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="edit/[id]"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              headerShown: false
            }}
          />
          <Stack.Screen
            name="report"
            options={{
              animation: 'slide_from_right',
            }}
          />
        </Stack>
      </Animated.View>
    </GestureHandlerRootView>
  );
};

export default function RootLayout() {
  useEffect(() => {
    // Basic migration for MVP - create table if not exists

    const query = `
      CREATE TABLE IF NOT EXISTS transactions (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        amount real NOT NULL,
        category text NOT NULL,
        type text NOT NULL,
        date integer NOT NULL,
        note text
      );
    `;
    // Use execSync for synchronous execution on mount to ensure DB is ready
    expoDb.execSync(query);
  }, []);

  return (
    <CurrencyProvider>
      <UserProvider>
        <ThemeProvider>
          <LayoutContent />
        </ThemeProvider>
      </UserProvider>
    </CurrencyProvider>
  );
}
