import { Schema, model, Document, Decimal128 } from 'mongoose';

// Define la interfaz para TypeScript
interface IOrder extends Document {
  orderNumber: number;
  clientName: string;
  companyName: string;
  workName: string;
  workType: string;
  productionQuantity: number;
  colors: string;
  processes: string;
  specialFinishes: string;
  palletsNumber?: number;
  technician: string;
  processingDate?: Date;
  processingTime: number;
  initialQuantity: number;
  processingDateInitial?: Date;
  // processingDateRate: number;
  finalQuantity: number;
  finalQuantityDifference: number;
  quantityRate: number;
  processingDateFinal?: Date;
  processingTimeFinal: number;
  processingTimeDifference: number;
  processingTimeRate: number;
  materialWeight: number;
  materialArea: number;
  status: number;
  quantityProcessed: number;
  updatedAt: Date;
  createdAt: Date;
}

// Esquema de Mongoose para la orden
const OrderSchema = new Schema<IOrder>({
  orderNumber: {
    type: Number,
    required: [true, 'Order number is required']
  },
  clientName: {
    type: String,
    required: [true, 'Client name must not be empty']
  },
  companyName: {
    type: String,
    required: [true, 'Company name must not be empty']
  },
  workName: {
    type: String,
    required: [true, 'Job name is required']
  },
  workType: {
    type: String,
    required: [true, 'Job type is required']
  },
  productionQuantity: {
    type: Number,
    required: [true, 'Production quantity is required']
  },
  colors: {
    type: String,
    required: [true, 'Colors are required']
  },
  processes: {
    type: String,
    required: [true, 'Processes are required']
  },
  specialFinishes: {
    type: String,
    required: [true, 'Special finishes are required']
  },
  palletsNumber: {
    type: Number,
    min: [0, 'Pallets number cannot be less than 0']
  },
  technician: {
    type: String,
    required: [true, 'Technician name is required']
  },
  processingDate: Date,
  processingTime: {
    type: Number,
    required: [true, 'Processing time is required']
  },
  initialQuantity: {
    type: Number,
    required: [false, 'Initial quantity is required']
  },
  processingDateInitial: Date,
  // processingDateRate: {
  //   type: Number,
  //   required: [false, 'Processing date rate is required']
  // },
  finalQuantity: {
    type: Number,
    required: [false, 'Final quantity is required']
  },
  finalQuantityDifference: {
    type: Number,
    required: [false, 'Final quantity difference is required']
  },
  quantityRate: {
    type: Number,
    required: [false, 'Quantity rate is required']
  },
  processingDateFinal: Date,
  processingTimeFinal: {
    type: Number,
    required: [false, 'Processing time final is required']
  },
  processingTimeDifference: {
    type: Number,
    required: [false, 'Processing time difference is required']
  },
  processingTimeRate: {
    type: Number,
    required: [false, 'Processing time rate is required']
  },
  materialWeight: {
    type: Number,
    required: [false, 'Material weight is required'],
    default: 0,
  },
  materialArea: {
    type: Number,
    required: [false, 'Material Area is required'],
    default: 0,
  },
  quantityProcessed: {
    type: Number,
    required: [false, 'quantityProcessed quantity is required'],
    default: 0,
  },
  status: {
    type: Number,
    default: 1,
    min: [1, 'Minimum status value is 1'],
    max: [4, 'Maximum status value is 4']
  }
}, {
  timestamps: true, // Automáticamente gestiona createdAt y updatedAt
  collection: 'orders'
});

// Creación del modelo
const OrderModel = model<IOrder>('Order', OrderSchema);

export { IOrder, OrderModel, OrderSchema };
