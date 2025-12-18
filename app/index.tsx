import { Button } from '@/src/presentation/components/Button';
import { ThemeToggle } from '@/src/presentation/components/ThemeToggle';
import { TransactionCard } from '@/src/presentation/components/TransactionCard';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { PieChart } from "react-native-gifted-charts";
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCurrency } from '@/src/presentation/context/CurrencyContext';
import { useTheme } from '@/src/presentation/context/ThemeContext';
import { useUser } from '@/src/presentation/context/UserContext';
import { useTransactionsViewModel } from '@/src/presentation/viewmodels/useTransactionsViewModel';

export default function Dashboard() {
    const { currency, setCurrency, formatCurrency } = useCurrency();
    const { userName, isLoading: isUserLoading } = useUser();
    const { toggleTheme, isDark } = useTheme();
    const router = useRouter();

    const { transactions: recentTransactions, isLoading: isTransactionsLoading, deleteTransaction, refresh } = useTransactionsViewModel();
    const [balance, setBalance] = useState({ income: 0, expense: 0, total: 0 });
    const [refreshing, setRefreshing] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!isUserLoading && !userName) {
            router.replace('/welcome');
        }
    }, [isUserLoading, userName, router]);

    // Calculate balance whenever transactions change
    useEffect(() => {
        const income = recentTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
        const expense = recentTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
        const total = income - expense;
        setBalance({ income, expense, total });
    }, [recentTransactions]);

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

    // Prepare Pie Data directly from balance state
    const pieData = [
        { value: balance.income, color: '#10b981', text: 'In' }, // emerald-500
        { value: balance.expense, color: '#f43f5e', text: 'Ex' }, // rose-500
    ].filter(d => d.value > 0);

    const chartData = pieData.length > 0 ? pieData : [{ value: 1, color: '#e5e7eb' }];

    // If still loading user, show spinner to prevent flash
    if (isUserLoading) {
        return (
            <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-transparent" edges={['top']}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? "white" : "black"} />
                }
                className="flex-1 px-6 pt-6"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">Hello,</Text>
                        <Text className="text-2xl font-bold text-gray-900 dark:text-white">{userName || 'User'} 👋</Text>
                    </View>
                    <View className="flex-row gap-3 items-center">
                        <ThemeToggle />

                        <Pressable
                            onPress={() => setCurrency(currency === 'IDR' ? 'USD' : 'IDR')}
                            className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-800 active:bg-indigo-100 dark:active:bg-indigo-800"
                        >
                            <Text className="text-indigo-600 dark:text-indigo-400 font-bold text-sm tracking-wide">{currency}</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Total Balance Card */}
                <LinearGradient
                    colors={['#4F46E5', '#3730A3']}
                    className="rounded-[36px] p-6 mb-8 shadow-xl shadow-indigo-500/30"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        borderRadius: 10
                    }}
                >
                    <View className="flex-row justify-between items-start mb-8">
                        <View>
                            <Text className="text-indigo-200 font-medium mb-1">Total Balance</Text>
                            <Text className="text-4xl font-bold text-white tracking-tight">
                                {formatCurrency(balance.total)}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row gap-4">
                        <View className="flex-1 bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                            <View className="flex-row items-center mb-1">
                                <View className="bg-emerald-400/20 p-1 rounded-full mr-2">
                                    <Ionicons name="arrow-down" size={12} color="#34D399" />
                                </View>
                                <Text className="text-indigo-100 text-xs">Income</Text>
                            </View>
                            <Text className="text-white font-bold text-lg" numberOfLines={1}>
                                {formatCurrency(balance.income)}
                            </Text>
                        </View>
                        <View className="flex-1 bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                            <View className="flex-row items-center mb-1">
                                <View className="bg-rose-400/20 p-1 rounded-full mr-2">
                                    <Ionicons name="arrow-up" size={12} color="#FB7185" />
                                </View>
                                <Text className="text-indigo-100 text-xs">Expense</Text>
                            </View>
                            <Text className="text-white font-bold text-lg" numberOfLines={1}>
                                {formatCurrency(balance.expense)}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Analytics Preview */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white">Analytics</Text>
                    <Pressable onPress={() => router.push('/report')} className="bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">
                        <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">View Report</Text>
                    </Pressable>
                </View>

                <View className="flex-row mb-8 items-center bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <View className="items-center justify-center mr-6">
                        <PieChart
                            data={chartData}
                            donut
                            radius={45}
                            innerRadius={30}
                        />
                    </View>
                    <View className="flex-1 justify-center gap-2">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                                <Text className="text-gray-500 dark:text-gray-400 text-xs">Income</Text>
                            </View>
                            <Text className="text-gray-900 dark:text-white font-bold text-xs">{Math.round((balance.income / (balance.income + balance.expense || 1)) * 100)}%</Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <View className="w-2 h-2 rounded-full bg-rose-500 mr-2" />
                                <Text className="text-gray-500 dark:text-gray-400 text-xs">Expense</Text>
                            </View>
                            <Text className="text-gray-900 dark:text-white font-bold text-xs">{Math.round((balance.expense / (balance.income + balance.expense || 1)) * 100)}%</Text>
                        </View>
                    </View>
                </View>

                {/* Recent Transactions */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white">Recent Transactions</Text>
                    <Pressable onPress={() => router.push('/transactions')}>
                        <Text className="text-indigo-600 dark:text-indigo-400 text-sm font-bold">See All</Text>
                    </Pressable>
                </View>

                <View className="pb-20">
                    {recentTransactions.slice(0, 5).map((transaction) => (
                        <View key={transaction.id} className="mb-3">
                            <TransactionCard
                                transaction={transaction}
                                onPress={() => router.push({ pathname: "/edit/[id]", params: { id: transaction.id } })}
                                onLongPress={() => handleDelete(transaction.id)}
                            />
                        </View>
                    ))}
                    {recentTransactions.length === 0 && (
                        <View className="h-40 items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-3xl">
                            <Text className="text-gray-300 dark:text-gray-600 font-medium">No transactions yet</Text>
                            <Button
                                title="Add First"
                                className="mt-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 h-auto text-sm"
                                onPress={() => router.push('/add')}
                            />
                        </View>
                    )}
                </View>

            </ScrollView>

            {/* Floating Action Button */}
            <Pressable
                onPress={() => router.push('/add')}
                className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full items-center justify-center shadow-lg shadow-indigo-500/40 active:bg-indigo-700 border-4 border-white dark:border-gray-900"
            >
                <Ionicons name="add" size={30} color="white" />
            </Pressable>
        </SafeAreaView>
    );
}
