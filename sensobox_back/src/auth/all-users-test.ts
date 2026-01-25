import * as bcrypt from 'bcrypt';
import { connect } from 'mongoose'; // O el ORM que estés utilizando
import { UserModel } from './domain/schemas/user.schema'; // Importa el modelo de usuario
import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const main = async () => {
  // Conectarse a la base de datos
  // await connect('mongodb://localhost:27017/sensobox', {
    // await connect('mongodb+srv://ortirafael8:4Af3QWOC90uEbExk@cluster0.l7wwmea.mongodb.net/sensobox?retryWrites=true&w=majority&appName=Cluster0/sensobox', {
    await connect(process.env.MONGODB_URL, {
    });


  try {
    // Obtener todos los usuarios
    const users = await UserModel.find();
        // Actualizar las contraseñas de los usuarios
    const updatedUsers = await Promise.all(users.map(async (user) => {
      const hashedPassword = await bcrypt.hash('testtest', 10);
      user.password = hashedPassword;
      return user.save();
    }));

      } catch (error) {
    console.error('Error al actualizar las contraseñas:', error);
  } finally {
    // Cerrar la conexión a la base de datos al finalizar
    await mongoose.disconnect();
  }
};

main();
