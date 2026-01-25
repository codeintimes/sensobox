export class GetOrdersByCompanyNameQuery {
  constructor(public readonly companyName: string, public readonly clientName?: string) {}
}
