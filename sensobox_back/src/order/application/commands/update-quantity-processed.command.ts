// src/orders/commands/update-quantity-processed.command.ts

import { ICommand } from '@nestjs/cqrs';

export class UpdateQuantityProcessedCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly quantityProcessed: number
  ) {}
}
