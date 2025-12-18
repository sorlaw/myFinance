import { Transaction } from '../entities/Transaction';
import { TransactionRepository } from '../repositories/TransactionRepository';

export class GetTransactionsUseCase {
    constructor(private repository: TransactionRepository) { }

    async execute(startDate?: Date, endDate?: Date): Promise<Transaction[]> {
        if (startDate && endDate) {
            return this.repository.getBetween(startDate, endDate);
        }
        return this.repository.getAll();
    }
}
