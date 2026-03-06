import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const transactions = sqliteTable('transactions', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    amount: integer('amount').notNull(), // stored in cents/smallest unit or just raw number
    category: text('category').notNull(), // e.g., 'Food', 'Transport'
    type: text('type').notNull(), // 'income' | 'expense'
    date: integer('date', { mode: 'timestamp' }).notNull(),
    note: text('note'),
}, (table) => ({
    dateIdx: index('date_idx').on(table.date),
    categoryIdx: index('category_idx').on(table.category),
    noteIdx: index('note_idx').on(table.note),
}));

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
