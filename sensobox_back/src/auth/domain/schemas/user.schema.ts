import { Schema, model, Document } from 'mongoose';

interface IUser extends Document {
  email: string;
  name: string;
  clientName: string;
  companyName: string;
  role: string;
  eco: boolean;
  ecoEmissions: number;
  password: string;
  contactName: string; // Nuevo campo
  contactPhone: string; // Nuevo campo
  contactEmail: string; // Nuevo campo
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email must not be empty'],
    unique: true,
    index: true,
    validate: {
      validator: function (email) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  name: {
    type: String,
    required: [true, 'Name must not be empty']
  },
  clientName: {
    type: String,
    required: [true, 'clientName must not be empty']
  },
  companyName: {
    type: String,
    required: [true, 'CompanyName must not be empty']
  },
  role: {
    type: String,
    required: [true, 'Role must not be empty']
  },
  eco: {
    type: Boolean,
    required: [true, 'Eco must not be empty'],
    default: false
  },
  ecoEmissions: {
    type: Number,
    required: [true, 'Eco emissions must not be empty'],
    default: 0
  },
  password: {
    type: String,
    required: [true, 'Password must not be empty 2'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  contactName: { // Nuevo campo
    type: String,
    required: [false, 'Contact name must not be empty']
  },
  contactPhone: { // Nuevo campo
    type: String,
    required: [false, 'Contact phone must not be empty']
  },
  contactEmail: { // Nuevo campo
    type: String,
    required: [false, 'Contact email must not be empty']
  }
}, {
  timestamps: true, // Automáticamente gestiona createdAt y updatedAt
  collection: 'users'
});

const UserModel = model<IUser>('User', UserSchema);

export { IUser, UserModel, UserSchema };