import { ICommand } from '@nestjs/cqrs';

export class RegisterCommand implements ICommand {
  constructor(
    public readonly email: string,
    public readonly name: string,
    public readonly companyName: string,
    public readonly clientName: string,
    public readonly password: string,
    public readonly role: string,
    public readonly contactName: string, // Añadir el campo contactName
    public readonly contactPhone: string, // Añadir el campo contactPhone
    public readonly contactEmail: string, // Añadir el campo contactEmail
  ) {}
}
