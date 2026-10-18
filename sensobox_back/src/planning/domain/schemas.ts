// Planifica · colecciones propias (no tocan las de pedidos de Sensobox; solo las enlazan por _id).
import { Schema } from 'mongoose';

export const PlanningResourceSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    kind: { type: String, default: 'maquina' }, // maquina | puesto
    line: { type: String, default: '' },
    calendarCode: { type: String, required: true },
    efficiency: { type: Number, default: 0.85 }, // factor de capacidad si no hay datos reales de Ritmia
    ritmia: { type: Boolean, default: false }, // la máquina está conectada a Ritmia
    sort: { type: Number, default: 0 },
  },
  { collection: 'planning_resources', timestamps: true },
);

export const PlanningCalendarSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    shifts: [{ _id: false, name: String, start: String, end: String, days: [Number] }],
    holidays: [String],
  },
  { collection: 'planning_calendars', timestamps: true },
);

export const PlanningArticleSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    route: [{ _id: false, seq: Number, name: String, resources: [String], setupMin: Number, ratePerHour: Number }],
  },
  { collection: 'planning_articles', timestamps: true },
);

export const PlanningOrderSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true }, // _id del pedido de Sensobox
    orderNumber: Number,
    articleCode: { type: String, required: true },
    dueDate: Date,
    priority: { type: Number, default: 3 },
    producedGood: { type: Number, default: 0 },
    producedBad: { type: Number, default: 0 },
    demo: { type: Boolean, default: false },
  },
  { collection: 'planning_orders', timestamps: true },
);

export const PlanningOperationSchema = new Schema(
  {
    orderId: { type: String, required: true },
    orderNumber: Number,
    articleCode: String,
    seq: Number,
    resourceCode: String,
    start: Date,
    end: Date,
    setupMin: Number,
    qty: Number,
    workMin: Number,
    locked: { type: Boolean, default: false },
  },
  { collection: 'planning_operations', timestamps: true },
);
