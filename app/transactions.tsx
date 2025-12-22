import { TransactionCard } from '@/src/presentation/components/TransactionCard';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/src/presentation/context/ThemeContext';
import { useTransactionsViewModel } from '@/src/presentation/viewmodels/useTransactionsViewModel';

export default function TransactionsScreen() {
    const { transactions: data, refresh, deleteTransaction } = useTransactionsViewModel();
    const [refreshing, setRefreshing] = useState(false);
    const { isDark } = useTheme();

    useFocusEffect(
        useCallback(() => {
            refresh();
        }, [refresh])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refresh();
        setRefreshing(false);
    }, [refresh]);

    const handleDelete = (id: number) => {
        Alert.alert(
            "Delete Transaction",
            "Are you sure you want to delete this transaction?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteTransaction(id);
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
            {/* Header */}
            <View className="flex-row items-center px-6 pt-2 pb-6 border-b border-gray-50 dark:border-gray-800">
                <Pressable
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-full items-center justify-center border border-gray-100 dark:border-gray-700 mr-4"
                >
                    <Ionicons name="arrow-back" size={20} color={isDark ? "white" : "#374151"} />
                </Pressable>
                <Text className="text-xl font-bold text-gray-900 dark:text-white">All Transactions</Text>
            </View>

            <FlatList
                data={data}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
                renderItem={({ item, index }) => (
                    <Animated.View entering={FadeInDown.delay(index * 50).springify()} className="mb-3">
                        <TransactionCard
                            transaction={item}
                            onPress={() => router.push(`/edit/${item.id}`)}
                            onLongPress={() => handleDelete(item.id)}
                        />
                    </Animated.View>
                )}
                ListEmptyComponent={
                    <View className="items-center py-20">
                        <View className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full items-center justify-center mb-4">
                            <Ionicons name="document-text-outline" size={32} color={isDark ? "#4b5563" : "#9ca3af"} />
                        </View>
                        <Text className="text-gray-400 dark:text-gray-500 font-medium">No transactions found</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
