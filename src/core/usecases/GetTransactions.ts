import { Transaction } from '../entities/Transaction';
import { TransactionRepository } from '../repositories/TransactionRepository';

export class GetTransactionsUseCase {
    constructor(private repository: TransactionRepository) { }

    async execute(startDate?: Date, endDate?: Date, query?: string, limit?: number, offset?: number): Promise<Transaction[]> {
        if (query) {
            return this.repository.search(query, limit, offset);
        }
        if (startDate && endDate) {
            return this.repository.getBetween(startDate, endDate);
        }
        return this.repository.getAll(limit, offset);
    }
}
