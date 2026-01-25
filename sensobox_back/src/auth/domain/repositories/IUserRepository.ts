import { IUser } from "../schemas/user.schema";

export interface IUserRepository {
  findAll(): Promise<IUser[]>;  // Use IUser for type checking
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  userExistsById(id: string): Promise<boolean>;
  emailExists(email: string): Promise<boolean>;
  createUser(userData: { name: string; companyName: string; email: string; password: string; role: string }): Promise<IUser>;
  update(userUpdate: { id: string; name?: string; companyName?: string; email?: string; password?: string }): Promise<IUser | null>;
  updateEcoData(id: string, eco: boolean, ecoEmissions: number): Promise<IUser | null>;
  updateEcoDataByClientName(clientName: string, eco: boolean, ecoEmissions: number): Promise<any>;
  delete(id: string): Promise<boolean>;
  findUserRoleById(id: string): Promise<string | null>;
  findNonSuperAdminUsers(): Promise<IUser[]>;
}
