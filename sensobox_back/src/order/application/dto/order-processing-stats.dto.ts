import { Decimal128 } from 'mongodb';

export class OrderProcessingStatsDTO {
    createdAt: string;
    processingTime: number;
    processingTimeReal: number;
    processingTimeRate: number;
}
