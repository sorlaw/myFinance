import { useCurrency } from '@/context/CurrencyContext';
import { Transaction } from '@/db/schema';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface TransactionCardProps {
    transaction: Transaction;
    onPress?: () => void;
    onLongPress?: () => void;
}

export const TransactionCard = ({ transaction, onPress, onLongPress }: TransactionCardProps) => {
    const isIncome = transaction.type === 'income';
    const { formatCurrency } = useCurrency();

    const { icon, color } = getCategoryIcon(transaction.category);

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            delayLongPress={500}
            activeOpacity={0.7}
            className="flex-row items-center bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
            <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${transaction.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'}`}>
                <Ionicons
                    name={icon as any}
                    size={20}
                    color={transaction.type === 'income' ? '#10b981' : '#f43f5e'}
                />
            </View>
            <View className="flex-1">
                <View className="flex-row justify-between items-start">
                    <Text className="text-gray-900 dark:text-gray-100 font-bold text-base mb-1" numberOfLines={1}>
                        {transaction.note || transaction.category}
                    </Text>
                    <Text className={`font-bold text-base ${transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </Text>
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-gray-500 dark:text-gray-400 text-xs capitalize">{transaction.category}</Text>
                    <Text className="text-gray-400 dark:text-gray-500 text-xs">
                        {new Date(transaction.date).toLocaleDateString()}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};
