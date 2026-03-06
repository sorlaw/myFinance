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
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 20;

    const fetchTransactions = useCallback(async (isLoadMore = false, query = searchQuery) => {
        if (isLoadMore) {
            setIsLoadingMore(true);
        } else {
            setIsLoading(true);
            setPage(0);
            setHasMore(true);
        }
        setError(null);
        try {
            const currentPage = isLoadMore ? page + 1 : 0;
            const data = await getUseCase.execute(
                undefined,
                undefined,
                query,
                PAGE_SIZE,
                currentPage * PAGE_SIZE
            );

            if (isLoadMore) {
                setTransactions(prev => [...prev, ...data]);
                setPage(currentPage);
            } else {
                setTransactions(data);
            }

            if (data.length < PAGE_SIZE) {
                setHasMore(false);
            }
        } catch (e) {
            setError('Failed to fetch transactions');
            console.error(e);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [page, searchQuery]);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        fetchTransactions(false, query);
    }, [fetchTransactions]);

    const loadMore = useCallback(() => {
        if (!isLoading && !isLoadingMore && hasMore) {
            fetchTransactions(true);
        }
    }, [fetchTransactions, isLoading, isLoadingMore, hasMore]);

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
        isLoadingMore,
        error,
        searchQuery,
        hasMore,
        setSearchQuery: handleSearch,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        loadMore,
        refresh: () => fetchTransactions(false)
    };
}
