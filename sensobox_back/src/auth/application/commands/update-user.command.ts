export class UpdateUserCommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    // public readonly companyName: string,
    public readonly email?: string,
    public readonly password?: string,
    public readonly contactName?: string, // Añadir el campo contactName
    public readonly contactPhone?: string, // Añadir el campo contactPhone
    public readonly contactEmail?: string, // Añadir el campo contactEmail
  ) {}
}
