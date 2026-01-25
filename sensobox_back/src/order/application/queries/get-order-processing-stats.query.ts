export class GetOrderProcessingStatsQuery {
  constructor(
    public readonly fromDate: string,
    public readonly companyName?: string,
    public readonly clientName?: string
  ) {}
}
