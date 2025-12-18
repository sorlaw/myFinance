export type TransactionType = 'income' | 'expense';

export interface Transaction {
    id: number;
    amount: number;
    category: string;
    type: TransactionType;
    date: Date;
    note?: string | null;
}
