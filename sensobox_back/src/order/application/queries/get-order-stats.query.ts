export class GetOrderStatsQuery {
  constructor(
    public readonly fromDate: string,
    public readonly companyName?: string,
    public readonly clientName?: string
  ) {}
}
