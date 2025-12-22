import { useCurrency } from '@/src/presentation/context/CurrencyContext';
import { useTheme } from '@/src/presentation/context/ThemeContext';
import { useTransactionsViewModel } from '@/src/presentation/viewmodels/useTransactionsViewModel';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, PieChart } from "react-native-gifted-charts";
import Animated, { SlideInLeft, SlideInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MonthlyReportScreen() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [direction, setDirection] = useState(1); // 1 = Next, -1 = Prev
    // Use ViewModel hook
    const { transactions: data, refresh } = useTransactionsViewModel();
    // Removed isLoading to prevent UI flicker
    const { formatCurrency } = useCurrency(); // Use global formatter

    const screenWidth = Dimensions.get('window').width;

    const fetchMonthData = useCallback(async () => {
        try {
            // Calculate start and end of selected month
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

            // Allow refresh to take args for date range filtering
            // Note: ViewModel implementation assumes single shared state.
            // If we use shared state for both Dashboard and Report, changing it here affects Dashboard.
            // However, with restricted context or dedicated instance, it works.
            // But `useTransactionsViewModel` creates new instance of UseCases BUT UseCases use SAME Repository? No, repo is new instance in ViewModel.
            // If repository is new instance, then it's fine.
            // In `useTransactionsViewModel.ts`: `const repository = new TransactionRepositoryImpl();` at MODULE LEVEL?
            // "const repository = new TransactionRepositoryImpl();" is outside function component in `useTransactionsViewModel.ts`.
            // Means it is SHARED SINGLETON (module scope).
            // So if I filter here, dashboard transactions will also be filtered if they share the same state?
            // `useTransactionsViewModel` call `const [transactions, setTransactions] = useState...`.
            // State is LOCAL to component using the hook.
            // BUT calling `refresh` calls `fetchTransactions` which calls `getUseCase.execute`.
            // `getUseCase` is shared instance.
            // `fetchTransactions` updates LOCAL `transactions` state.
            // So calling `refresh(start, end)` here updates `data` here.
            // It does NOT affect `transactions` in `Dashboard` because that component has its own `useState`.
            // So this is safe.
            await refresh(startOfMonth, endOfMonth);

        } catch (e) {
            console.error(e);
        }
    }, [currentDate, refresh]);

    useEffect(() => {
        fetchMonthData();
    }, [fetchMonthData]);

    // --- Data Processing ---

    // 1. Summary Stats
    const income = data.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const expense = data.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const net = income - expense;

    // 2. Daily Expense Data for Bar Chart
    const dailyExpenses = new Array(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()).fill(0);
    data.filter(t => t.type === 'expense').forEach(t => {
        const day = t.date.getDate() - 1; // 0-indexed
        dailyExpenses[day] += t.amount;
    });

    const barData = dailyExpenses.map((amount, index) => ({
        value: amount,
        label: (index + 1) % 5 === 0 || index === 0 ? (index + 1).toString() : '', // Show label every 5 days
        frontColor: '#f43f5e',
        spacing: 4,
    }));

    // 3. Category Pie Data
    const categoryMap: Record<string, number> = {};
    data.filter(t => t.type === 'expense').forEach(t => {
        let category = t.category.trim(); // Trim whitespace
        // Normalize case: Capitalize first letter, rest lowercase (optional, but good for consistency)
        if (category.length > 0) {
            category = category.charAt(0).toUpperCase() + category.slice(1);
        }

        // Bug fix: Merge 'Bensin' into 'Transportasi'
        if (category.toLowerCase() === 'bensin') {
            category = 'Transportasi';
        }
        categoryMap[category] = (categoryMap[category] || 0) + t.amount;
    });

    const pieData = Object.keys(categoryMap).map((cat, index) => {
        const { color } = getCategoryIcon(cat);
        return {
            value: categoryMap[cat],
            color: color,
            text: '', // too small to show text inside usually
            category: cat // custom prop for legend
        };
    }).sort((a, b) => b.value - a.value); // Sort highest first

    const changeMonth = (offset: number) => {
        setDirection(offset);
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
        // Data is updated via refresh call which updates the hook state
        // setData(result); // Removed // Clear old data immediately to prevent stale stats during transition
    };

    const { isDark } = useTheme();

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
            {/* Header */}
            <View className="flex-row items-center px-6 pt-2 pb-4">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-full items-center justify-center border border-gray-100 dark:border-gray-700 mr-4"
                >
                    <Ionicons name="arrow-back" size={20} color={isDark ? "white" : "#374151"} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900 dark:text-white">Monthly Report</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Month Selector */}
                <View className="flex-row justify-center items-center mb-6">
                    <TouchableOpacity onPress={() => changeMonth(-1)} className="p-2">
                        <Ionicons name="chevron-back" size={24} color={isDark ? "white" : "#374151"} />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900 dark:text-white mx-4 w-40 text-center">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>
                    <TouchableOpacity onPress={() => changeMonth(1)} className="p-2">
                        <Ionicons name="chevron-forward" size={24} color={isDark ? "white" : "#374151"} />
                    </TouchableOpacity>
                </View>

                {/* Content with Slide Animation */}
                <Animated.View
                    key={currentDate.toISOString()} // Ensures chart and numbers refresh effectively
                    entering={direction > 0 ? SlideInRight.duration(300) : SlideInLeft.duration(300)}
                    className="px-6 pb-20"
                >
                    {/* Summary Cards */}
                    <View className="flex-row gap-3 mb-6">
                        <View className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900">
                            <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase mb-1">Income</Text>
                            <Text className="text-gray-900 dark:text-gray-100 font-bold text-base" numberOfLines={1}>
                                {formatCurrency(income)}
                            </Text>
                        </View>
                        <View className="flex-1 bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900">
                            <Text className="text-rose-600 dark:text-rose-400 text-xs font-bold uppercase mb-1">Expense</Text>
                            <Text className="text-gray-900 dark:text-gray-100 font-bold text-base" numberOfLines={1}>
                                {formatCurrency(expense)}
                            </Text>
                        </View>
                    </View>
                    <View className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900 mb-8 flex-row justify-between items-center">
                        <View>
                            <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase mb-1">Net Balance</Text>
                            <Text className={`font-bold text-xl ${net >= 0 ? 'text-indigo-900 dark:text-indigo-100' : 'text-rose-600 dark:text-rose-400'}`}>
                                {net >= 0 ? '+' : ''}{formatCurrency(net)}
                            </Text>
                        </View>
                        <View className={`w-10 h-10 rounded-full items-center justify-center ${net >= 0 ? 'bg-indigo-200 dark:bg-indigo-500/30' : 'bg-rose-200 dark:bg-rose-500/30'}`}>
                            <Ionicons
                                name={net >= 0 ? "thumbs-up" : "warning"}
                                size={20}
                                color={
                                    net >= 0
                                        ? (isDark ? "#a5b4fc" : "#3730a3") // Light Indigo vs Deep Indigo
                                        : (isDark ? "#fda4af" : "#9f1239") // Light Rose vs Deep Rose
                                }
                            />
                        </View>
                    </View>

                    {/* Daily Expense Chart */}
                    <View className="mb-8">
                        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Daily Expenses</Text>
                        {expense > 0 ? (
                            <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 pb-6">
                                <BarChart
                                    key={currentDate.toISOString()} // Crucial for reset
                                    data={barData}
                                    barWidth={8}
                                    spacing={4}
                                    roundedTop
                                    roundedBottom
                                    hideRules
                                    xAxisThickness={0}
                                    yAxisThickness={0}
                                    yAxisTextStyle={{ color: isDark ? '#9CA3AF' : '#9CA3AF', fontSize: 10 }}
                                    xAxisLabelTextStyle={{ color: isDark ? '#D1D5DB' : '#6B7280', fontSize: 10 }}
                                    noOfSections={4}
                                    maxValue={Math.ceil(Math.max(...dailyExpenses, 1000) / 1000) * 1000}
                                    height={160}
                                    initialSpacing={10}
                                    isAnimated // Re-enabled!
                                    animationDuration={600}
                                />
                            </View>
                        ) : (
                            <View className="h-40 items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-2xl border-dashed border border-gray-200 dark:border-gray-700">
                                <Text className="text-gray-400">No expenses this month</Text>
                            </View>
                        )}
                    </View>

                    {/* Category Breakdown */}
                    <View>
                        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Categories</Text>

                        {pieData.length > 0 ? (
                            <View className="flex-row">
                                {/* Pie */}
                                <View className="items-center justify-center mr-6">
                                    <PieChart
                                        data={pieData}
                                        donut
                                        radius={60}
                                        innerRadius={40}
                                    />
                                </View>

                                {/* Legend / List */}
                                <View className="flex-1 justify-center gap-3">
                                    {pieData.slice(0, 4).map((item, index) => (
                                        <View key={index} className="flex-row items-center justify-between">
                                            <View className="flex-row items-center flex-1 mr-2">
                                                <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                                                <Text className="text-gray-600 dark:text-gray-300 text-sm font-medium" numberOfLines={1}>{item.category}</Text>
                                            </View>
                                            <Text className="text-gray-900 dark:text-white font-bold text-sm">
                                                {Math.round((item.value / expense) * 100)}%
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ) : (
                            <View className="h-40 items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-2xl border-dashed border border-gray-200 dark:border-gray-700">
                                <Text className="text-gray-400">No data available</Text>
                            </View>
                        )}
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}
