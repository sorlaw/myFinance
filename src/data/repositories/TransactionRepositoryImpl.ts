import { and, desc, eq, gte, lte, sum } from 'drizzle-orm';
import { Transaction, TransactionType } from '../../core/entities/Transaction';
import { TransactionRepository } from '../../core/repositories/TransactionRepository';
import { db } from '../datasources/local/database';
import { transactions, type Transaction as DbTransaction, type NewTransaction } from '../datasources/local/schema';

const mapToEntity = (dbTx: DbTransaction): Transaction => ({
    id: dbTx.id,
    amount: dbTx.amount,
    category: dbTx.category,
    type: dbTx.type as TransactionType,
    date: dbTx.date,
    note: dbTx.note,
});

export class TransactionRepositoryImpl implements TransactionRepository {
    async getAll(): Promise<Transaction[]> {
        const result = await db.select().from(transactions).orderBy(desc(transactions.date));
        return result.map(mapToEntity);
    }

    async getById(id: number): Promise<Transaction | null> {
        const result = await db.select().from(transactions).where(eq(transactions.id, id));
        return result.length > 0 ? mapToEntity(result[0]) : null;
    }

    async getBetween(startDate: Date, endDate: Date): Promise<Transaction[]> {
        const result = await db.select().from(transactions)
            .where(and(gte(transactions.date, startDate), lte(transactions.date, endDate)))
            .orderBy(desc(transactions.date));
        return result.map(mapToEntity);
    }

    async create(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
        const newTx: NewTransaction = {
            amount: transaction.amount,
            category: transaction.category,
            type: transaction.type,
            date: transaction.date,
            note: transaction.note,
        };
        const result = await db.insert(transactions).values(newTx).returning();
        return mapToEntity(result[0]);
    }

    async update(transaction: Transaction): Promise<void> {
        await db.update(transactions)
            .set({
                amount: transaction.amount,
                category: transaction.category,
                type: transaction.type,
                date: transaction.date,
                note: transaction.note,
            })
            .where(eq(transactions.id, transaction.id));
    }

    async delete(id: number): Promise<void> {
        await db.delete(transactions).where(eq(transactions.id, id));
    }

    async getTotalIncome(): Promise<number> {
        const result = await db.select({ value: sum(transactions.amount) })
            .from(transactions)
            .where(eq(transactions.type, 'income'));
        return Number(result[0]?.value ?? 0);
    }

    async getTotalExpense(): Promise<number> {
        const result = await db.select({ value: sum(transactions.amount) })
            .from(transactions)
            .where(eq(transactions.type, 'expense'));
        return Number(result[0]?.value ?? 0);
    }
}
