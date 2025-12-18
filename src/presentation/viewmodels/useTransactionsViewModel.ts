import { useCallback, useEffect, useState } from 'react';
import { Transaction } from '../../core/entities/Transaction';
import { AddTransactionUseCase } from '../../core/usecases/AddTransaction';
import { DeleteTransactionUseCase } from '../../core/usecases/DeleteTransaction';
import { GetTransactionsUseCase } from '../../core/usecases/GetTransactions';
import { UpdateTransactionUseCase } from '../../core/usecases/UpdateTransaction';
import { TransactionRepositoryImpl } from '../../data/repositories/TransactionRepositoryImpl';

// In a real app with DI, these would be injected.
const repository = new TransactionRepositoryImpl();
const addUseCase = new AddTransactionUseCase(repository);
const getUseCase = new GetTransactionsUseCase(repository);
const deleteUseCase = new DeleteTransactionUseCase(repository);
const updateUseCase = new UpdateTransactionUseCase(repository);

export function useTransactionsViewModel() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async (startDate?: Date, endDate?: Date) => {
        setIsLoading(true);
        setError(null);
        try {
            let data;
            if (startDate && endDate) {
                // Assuming we could expose this via repository directly or use case
                // Ideally create a GetTransactionsInRangeUseCase but for simplicity calling repo via a new usecase or just assume GetTransactions fetches all and we filter?
                // No, let's stick to valid architecture.
                // Let's modify GetTransactionsUseCase to accept optional range?
                // Or just instantiate repository here? No, stick to use cases.
                // Let's assume GetTransactions gets all for now, and we can refactor `report.tsx` to use a separate logic or simple filter?
                // Actually better to just add `getBetween` to repo and simple call.
                // I will simply add `getBetween` to the repo impl and call it from here if params provided?
                // Cleanest: `GetTransactionsUseCase` accepts filter.
                data = await getUseCase.execute(startDate, endDate);
            } else {
                data = await getUseCase.execute();
            }
            setTransactions(data);
        } catch (e) {
            setError('Failed to fetch transactions');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
        setIsLoading(true);
        try {
            await addUseCase.execute(transaction);
            // Refresh list or simple optimistic update
            await fetchTransactions();
        } catch (e) {
            setError('Failed to add transaction');
            console.error(e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    }, [fetchTransactions]);

    const deleteTransaction = useCallback(async (id: number) => {
        try {
            await deleteUseCase.execute(id);
            await fetchTransactions();
        } catch (e) {
            console.error(e);
            setError('Failed to delete transaction');
        }
    }, [fetchTransactions]);

    const updateTransaction = useCallback(async (transaction: Transaction) => {
        try {
            await updateUseCase.execute(transaction);
            await fetchTransactions();
        } catch (e) {
            console.error(e);
            setError('Failed to update transaction');
        }
    }, [fetchTransactions]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    return {
        transactions,
        isLoading,
        error,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        refresh: fetchTransactions
    };
}
