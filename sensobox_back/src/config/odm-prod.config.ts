import mongoose from 'mongoose';

// Convierte el entorno de las variables de puerto en un número y proporciona un valor por defecto.
// const MONGO_URI = `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT || 27017}/${process.env.MONGODB_DATABASE}`;
// const MONGO_URI = "mongodb+srv://ortirafael8:4Af3QWOC90uEbExk@cluster0.l7wwmea.mongodb.net/sensobox?retryWrites=true&w=majority&appName=Cluster0/sensobox";

import * as dotenv from 'dotenv';
dotenv.config();
const MONGO_URI = process.env.MONGODB_URL
mongoose.connect(MONGO_URI, {})
.then(() => console.log("Connected to MongoDB successfully."))
.catch(err => console.error("MongoDB connection error:", err));

// Mongoose no utiliza migrations de la misma manera que TypeORM, por lo tanto, esa parte se omite aquí.
