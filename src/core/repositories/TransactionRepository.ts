import { Transaction } from '../entities/Transaction';

export interface TransactionRepository {
    getAll(limit?: number, offset?: number): Promise<Transaction[]>;
    getById(id: number): Promise<Transaction | null>;
    getBetween(startDate: Date, endDate: Date): Promise<Transaction[]>;
    search(query: string, limit?: number, offset?: number): Promise<Transaction[]>;
    create(transaction: Omit<Transaction, 'id'>): Promise<Transaction>;
    update(transaction: Transaction): Promise<void>;
    delete(id: number): Promise<void>;
    getTotalIncome(): Promise<number>;
    getTotalExpense(): Promise<number>;
    deleteBeforeDate(date: Date): Promise<void>;
}
