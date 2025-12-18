import { Transaction } from '../entities/Transaction';
import { TransactionRepository } from '../repositories/TransactionRepository';

export class AddTransactionUseCase {
    constructor(private repository: TransactionRepository) { }

    async execute(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
        if (transaction.amount <= 0) {
            throw new Error('Amount must be positive');
        }
        return this.repository.create(transaction);
    }
}
