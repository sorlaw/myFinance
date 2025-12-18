import { useCurrency } from '@/src/presentation/context/CurrencyContext';
import { useTheme } from '@/src/presentation/context/ThemeContext';
import { useTransactionsViewModel } from '@/src/presentation/viewmodels/useTransactionsViewModel';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddTransaction() {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [note, setNote] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const { currency, symbol } = useCurrency();
    const { isDark } = useTheme();

    const { addTransaction } = useTransactionsViewModel();

    const formatAmount = (value: string) => {
        const number = value.replace(/\D/g, '');
        if (currency === 'IDR') {
            return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        } else {
            return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
    };

    const handleAmountChange = (text: string) => {
        setAmount(formatAmount(text));
    };

    const handleSubmit = async () => {
        const cleanAmount = amount.replace(/[.,]/g, '');

        if (!cleanAmount || !category) {
            Alert.alert('Error', 'Please fill Amount and Category');
            return;
        }

        try {
            await addTransaction({
                amount: parseFloat(cleanAmount),
                category,
                note,
                type,
                date: new Date(),
            });
            router.back();
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to save transaction');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
            <View className="flex-1">
                {/* Header */}
                <Animated.View entering={FadeInDown.duration(600).springify()} className="flex-row justify-between items-center px-6 pt-2 pb-6">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-full items-center justify-center border border-gray-100 dark:border-gray-700"
                    >
                        <Ionicons name="arrow-back" size={20} color={isDark ? "white" : "#374151"} />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-gray-900 dark:text-white">Add Transaction</Text>
                    <View className="w-10" />
                </Animated.View>

                <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>

                    {/* Segmented Control */}
                    <Animated.View
                        entering={FadeInDown.delay(100).duration(600).springify()}
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                            borderRadius: 30,
                            padding: 4,
                            height: 56,
                            marginBottom: 32,
                            width: '100%'
                        }}
                    >
                        <Pressable
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 26,
                                backgroundColor: type === 'income' ? (isDark ? '#374151' : '#FFFFFF') : 'transparent',
                                shadowColor: type === 'income' ? '#000' : 'transparent',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: type === 'income' ? 0.08 : 0,
                                shadowRadius: 4,
                                elevation: type === 'income' ? 3 : 0,
                            }}
                            onPress={() => setType('income')}
                        >
                            <Ionicons
                                name={type === 'income' ? "arrow-up-circle" : "arrow-up-circle-outline"}
                                size={18}
                                color={type === 'income' ? '#10B981' : '#9CA3AF'}
                                style={{ marginRight: 6 }}
                            />
                            <Text style={{
                                fontWeight: '700',
                                fontSize: 14,
                                color: type === 'income' ? '#10B981' : (isDark ? '#9CA3AF' : '#6B7280')
                            }}>Income</Text>
                        </Pressable>

                        <Pressable
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 26,
                                backgroundColor: type === 'expense' ? (isDark ? '#374151' : '#FFFFFF') : 'transparent',
                                shadowColor: type === 'expense' ? '#000' : 'transparent',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: type === 'expense' ? 0.08 : 0,
                                shadowRadius: 4,
                                elevation: type === 'expense' ? 3 : 0,
                            }}
                            onPress={() => setType('expense')}
                        >
                            <Ionicons
                                name={type === 'expense' ? "arrow-down-circle" : "arrow-down-circle-outline"}
                                size={18}
                                color={type === 'expense' ? '#F43F5E' : '#9CA3AF'}
                                style={{ marginRight: 6 }}
                            />
                            <Text style={{
                                fontWeight: '700',
                                fontSize: 14,
                                color: type === 'expense' ? '#F43F5E' : (isDark ? '#9CA3AF' : '#6B7280')
                            }}>Expense</Text>
                        </Pressable>
                    </Animated.View>

                    {/* Amount Input */}
                    <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} className="items-center mb-10 px-4">
                        <Text className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-widest">Enter Amount</Text>
                        <View className="flex-row items-center justify-center w-full">
                            <Text
                                style={{
                                    fontSize: amount.length > 10 ? 24 : amount.length > 7 ? 32 : 42,
                                    fontWeight: '700',
                                    color: type === 'income' ? '#10B981' : '#F43F5E',
                                    marginRight: 4
                                }}
                            >{symbol}</Text>
                            <TextInput
                                style={{
                                    fontSize: amount.length > 10 ? 24 : amount.length > 7 ? 32 : 48,
                                    fontWeight: '700',
                                    color: isDark ? '#FFFFFF' : '#111827',
                                    paddingVertical: 0,
                                    minWidth: 40,
                                    textAlign: 'left'
                                }}
                                keyboardType="number-pad"
                                placeholder="0"
                                placeholderTextColor={isDark ? "#4B5563" : "#D1D5DB"}
                                value={amount}
                                onChangeText={handleAmountChange}
                                autoFocus
                                selectionColor={type === 'income' ? '#10B981' : '#F43F5E'}
                            />
                        </View>
                    </Animated.View>

                    {/* Form Inputs */}
                    <Animated.View entering={FadeInDown.delay(300).duration(600).springify()} className="gap-y-4">
                        <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl flex-row items-center border border-gray-100 dark:border-gray-700">
                            <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'}`}>
                                <Ionicons name="grid-outline" size={20} color={type === 'income' ? '#10B981' : '#F43F5E'} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xs text-gray-400 font-medium mb-0.5">Category</Text>
                                <TextInput
                                    className="text-gray-900 dark:text-white font-semibold text-base p-0"
                                    placeholder="Food, Shopping, etc."
                                    placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                                    value={category}
                                    onChangeText={setCategory}
                                />
                            </View>
                        </View>

                        <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl flex-row items-center border border-gray-100 dark:border-gray-700">
                            <View className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center mr-3">
                                <Ionicons name="document-text-outline" size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xs text-gray-400 font-medium mb-0.5">Note</Text>
                                <TextInput
                                    className="text-gray-900 dark:text-white font-medium text-base p-0"
                                    placeholder="Add a description..."
                                    placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                                    value={note}
                                    onChangeText={setNote}
                                />
                            </View>
                        </View>
                    </Animated.View>
                    <View className="h-10" />
                </ScrollView>

                {/* Submit Button */}
                <Animated.View entering={FadeInUp.delay(400).duration(600).springify()} className="p-6 border-t border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <TouchableOpacity
                        onPress={handleSubmit}
                        activeOpacity={0.8}
                        className={`w-full py-4 rounded-2xl flex-row justify-center items-center shadow-lg ${type === 'income' ? 'bg-black dark:bg-emerald-600 shadow-emerald-200 dark:shadow-none' : 'bg-black dark:bg-rose-600 shadow-rose-200 dark:shadow-none'}`}
                        style={{ elevation: 4 }}
                    >
                        <Text className="text-white font-bold text-lg mr-2">Save Transaction</Text>
                        <Ionicons name="checkmark-circle" size={24} color="white" />
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}
