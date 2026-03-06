import { TransactionRepository } from '../repositories/TransactionRepository';

export class CleanupService {
    constructor(private repository: TransactionRepository) { }

    /**
     * Deletes all transactions from previous years.
     * This considers "previous years" as any date before January 1st of the current year.
     */
    async clearPreviousYearsData(): Promise<void> {
        try {
            const currentYear = new Date().getFullYear();
            const startOfCurrentYear = new Date(currentYear, 0, 1); // Jan 1st, 00:00:00

            console.log(`[CleanupService] Starting cleanup of data before ${startOfCurrentYear.toISOString()}`);
            await this.repository.deleteBeforeDate(startOfCurrentYear);
            console.log(`[CleanupService] Cleanup completed successfully.`);
        } catch (error) {
            console.error('[CleanupService] Error during data cleanup:', error);
        }
    }
}
