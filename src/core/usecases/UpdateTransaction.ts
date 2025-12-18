import { Transaction } from '../entities/Transaction';
import { TransactionRepository } from '../repositories/TransactionRepository';

export class UpdateTransactionUseCase {
    constructor(private repository: TransactionRepository) { }

    async execute(transaction: Transaction): Promise<void> {
        if (transaction.amount <= 0) {
            throw new Error('Amount must be positive');
        }
        return this.repository.update(transaction);
    }
}
