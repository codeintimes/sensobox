// src/orders/commands/update-material-info.command.ts

import { ICommand } from '@nestjs/cqrs';

export class UpdateMaterialInfoCommand implements ICommand {
  constructor(
    public readonly id: string,
    public materialWeight: number,
    public materialArea: number
  ) {}
}
