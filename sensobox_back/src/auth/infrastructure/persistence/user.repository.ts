
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Injectable, Scope } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'; // Usa InjectModel para inyectar el modelo de Mongoose
import { Model } from 'mongoose'; // Importa Model de mongoose
import { UserModel, IUser } from '../../domain/schemas/user.schema';



export class UserRepository implements IUserRepository {
  constructor(
    @InjectModel('User') private userModel: Model<IUser> // Inyecta el modelo de Mongoose
  ) { }

  async findAll(): Promise<IUser[]> {
    return this.userModel.find().sort({ createdAt: -1 }).exec();
  }

  async updateEcoDataByClientName(clientName: string, eco: any, ecoEmissions: any): Promise<any> {
    return await this.userModel.updateMany(
      { clientName: clientName },
      { $set: { eco: eco, ecoEmissions: ecoEmissions } },
    ).exec();
  }
  // src/infrastructure/persistence/user.repository.ts

  async findAdminAndTechnicianUsers(companyName?: string): Promise<IUser[]> {
    const query = { role: { $in: ['admin', 'technician'] } };
  
    if (companyName) {
      query['companyName'] = companyName;
    }
  
    return this.userModel.find(query)
      .sort({ role: 1 })  // 'admin' tiene mayor prioridad en ordenación
      .sort({ createdAt: -1 })
      .exec();
  }
  
  async findLevelUsers(client?: string, companyName?: string): Promise<IUser[]> {
    const query = companyName ? { role: client, companyName } : { role: client };
    return this.userModel.find(query).sort({ createdAt: -1 }).exec();
  }
  // src/infrastructure/persistence/user.repository.ts

  async findUsersRole(companyName?: string): Promise<IUser[]> {
    const query = companyName ? { role: 'client', companyName } : { role: 'client' };
    return this.userModel.find(query).sort({ createdAt: -1 }).exec();
  }
  
  async findByName(name: string): Promise<IUser | null> {
    return this.userModel.findOne({ name }).exec();
  }

  async findById(id: string): Promise<IUser | null> {
    return this.userModel.findById(id).exec();
  }

  async findUsersByCompanyName(companyName: string): Promise<IUser[]> {
    return this.userModel.find({ companyName, role: 'client' }).sort({ createdAt: -1 }).exec();
  }  

  async userExistsById(id: string): Promise<boolean> {
    const count = await this.userModel.countDocuments({ _id: id }).exec();
    return count > 0;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.userModel.countDocuments({ email }).exec();
    return count > 0;
  }

  async createUser(userData: { name: string; companyName: string; clientName: string; email: string; password: string; role: string; contactName: string; contactPhone: string; contactEmail: string }): Promise<IUser> {
    //console.log("Node debería entrar aquí",userData);
    const newUser = await this.userModel.create(userData);
    //console.log("Node debería entrar aquí");
    return newUser;
  }  

  async update(userUpdate: { name?:  string; id: string; email?: string; password?: string; contactName?: string; contactPhone?: string; contactEmail?: string;}): Promise<IUser | null> {
    const user = await this.userModel.findById(userUpdate.id).exec();
    if (user) {
      if (userUpdate.name) user.name = userUpdate.name;
      if (userUpdate.email) user.email = userUpdate.email;
      if (userUpdate.password) user.password = userUpdate.password;
      if (userUpdate.contactName) user.contactName = userUpdate.contactName;
      if (userUpdate.contactPhone) user.contactPhone = userUpdate.contactPhone;
      if (userUpdate.contactEmail) user.contactEmail = userUpdate.contactEmail;
      await user.save();
      return user;
    }
    return null;
  }

  async updateEcoData(id: string, eco: boolean, ecoEmissions: number): Promise<IUser | null> {
    const user = await this.userModel.findById(id).exec();
    if (user) {
      user.eco = eco;
      user.ecoEmissions = ecoEmissions; // Actualizar ecoEmissions también
      await user.save();
      return user;
    }
    return null;
  }
  

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  async findUserRoleById(id: string): Promise<string | null> {
    const user = await this.userModel.findById(id, 'role').exec();
    return user?.role;
  }

  async findNonSuperAdminUsers(): Promise<IUser[]> {
    return this.userModel.find({ role: { $ne: 'superadmin' } }).exec();
  }
}
