// src/application/dto/order-statistics.dto.ts


export class OrderStatisticsDTO {
    totalProductionQuantityLastMonth: number;
    orderCountLastMonth: number;
    // totalProcessingDateDifferenceLastMonth: number;
    totalProcessingTimeDifferenceLastMonth: number;
    totalFinalQuantityDifferenceLastMonth: number;

    totalProductionQuantityLastYear: number;
    orderCountLastYear: number;
    // totalProcessingDateDifferenceLastYear: number;
    totalProcessingTimeDifferenceLastYear: number;
    totalFinalQuantityDifferenceLastYear: number;
    totalOrdersByCompany: number;
    totalProductionByCompany: number;

    allPending: any;
    futurePending: any;
}
