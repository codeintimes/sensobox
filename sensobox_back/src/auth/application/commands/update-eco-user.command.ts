// src/commands/update-eco-data.command.ts

export class UpdateEcoDataCommand {
    constructor(
      public readonly clientName: string,
      public readonly eco: boolean,
      public readonly ecoEmissions: number,
    ) {}
  }
  