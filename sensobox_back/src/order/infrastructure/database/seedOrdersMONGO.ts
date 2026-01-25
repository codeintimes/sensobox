const mongoose = require('mongoose');
import { OrderModel } from '../../domain/schemas/order.schema';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';
dotenv.config();

// require('dotenv').config();

// Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/sensobox', {
// mongoose.connect("mongodb+srv://ortirafael8:4Af3QWOC90uEbExk@cluster0.l7wwmea.mongodb.net/sensobox?retryWrites=true&w=majority&appName=Cluster0/sensobox", {
mongoose.connect(process.env.MONGODB_URL, {});

const limitedNames = [
    'Eco Logistics Inc.',
    'Sustainable Packaging Solutions',
    'Green Shipping Co.',
    'Eco-Friendly Supply Chain Services',
    'BioPack Distributors',
    'GreenGoods Distributing',
    'Sustainable Supply Co.',
    'EcoShipping Services',
    'Earthwise Logistics',
    'EnviroBox Distributors',
    // Agrega más nombres según sea necesario
];
// const companyNames = Array.from({ length: 30 }, () => faker.company.name());
const companyNames = [
    "CartonTech Innovations",
    "EcoPack Solutions",
    "BoxCraft Ltd",
    "GreenBox Industries",
    "Pioneer Carton Co.",
    "UltraPack Creations",
    "SecureBox Manufacturing",
    "Global Cartons Ltd",
    "Premium Box Co.",
    "PackWell Enterprises",
    "Infinity Cartons",
    "EcoFriendly Packaging",
    "ProBox Materials",
    "SmartPack Technologies",
    "Durable Carton Co.",
    "CartonEdge Systems",
    "FoldPak Solutions",
    "CartonPro Distributors",
    "BoxZone Manufacturing",
    "GreenEdge Cartons",
    "PackSecure Solutions",
    "Alliance Carton Co.",
    "RecyclePack Innovations",
    "SolidBox Enterprises",
    "PurePack Carton Co.",
    "MaxiCarton Industries",
    "BioPack Solutions",
    "EverPack Systems",
    "CartonLogix Corp.",
    "UniBox Global"
];
const TechnicianNames = [
    "Ana García",
    "María Fernández",
    "Laura Martínez",
    "Elena Rodríguez",
    "Carmen López",
    "Isabel Sánchez",
    "Juan Hernández",
    "Carlos Díaz",
    "Pedro Morales",
    "José Alonso",
    "Miguel Ruiz",
    "Antonio Romero",
    "Alex Castro",
    "Taylor Rubio",
    "Sofía Gómez"
];

async function generateOrders(count) {
    for (let i = 0; i < count; i++) {
        const createdAt = faker.date.between({
            from: new Date(new Date().getFullYear() - 5, 0, 1),
            to: new Date()
        });
        const processingDate = faker.date.between({
            from: new Date(new Date().getFullYear() - 2, new Date().getMonth(), new Date().getDate()),
            to: new Date()
        });
        
        // Fecha de inicio de procesamiento, entre processingDate y 2 meses después
        const processingDateInitial = faker.date.between({
            from: processingDate,
            to: new Date(processingDate.getTime() + 2 * 30 * 24 * 60 * 60 * 1000) // 2 meses después
        });
        
        // Fecha final de procesamiento, entre processingDateInitial y 2 meses después
        const processingDateFinal = faker.date.between({
            from: processingDateInitial,
            to: new Date(processingDateInitial.getTime() + 2 * 30 * 24 * 60 * 60 * 1000) // 2 meses después
        });
        
        const productionQuantity = faker.number.int({ min: 1000, max: 10000 });
        const initialQuantity = productionQuantity + faker.number.int({ min: 100, max: 1000 });
        const finalQuantity = productionQuantity + faker.number.int({ min: 10, max: 100 });
        const processingTime = faker.number.int({ min: 4500, max: 5200 });
        const processingTimeFinal = processingTime + faker.number.int({ min: 0, max: 1000 });


        const order = new OrderModel({
            orderNumber: faker.number.int({ min: 100000, max: 999999 }),
            clientName: faker.helpers.arrayElement(limitedNames),
            companyName: faker.helpers.arrayElement(companyNames),
            workName: faker.commerce.productName(),
            workType: faker.commerce.productMaterial(),
            productionQuantity: productionQuantity,
            colors: faker.color.rgb(),
            processes: faker.commerce.productAdjective(),
            specialFinishes: faker.commerce.productMaterial(),
            palletsNumber: faker.number.int({ min: 0, max: 20 }),
            materialArea: faker.number.int({ min: 0, max: 20 }),
            materialWeight: faker.number.int({ min: 0, max: 20 }),
            quantityProcessed: Math.round(productionQuantity * faker.number.float({ min: 0, max: 1 })),
            technician: faker.helpers.arrayElement(TechnicianNames),

            initialQuantity: initialQuantity,
            finalQuantity: finalQuantity,
            quantityRate: finalQuantity/initialQuantity,
            finalQuantityDifference: initialQuantity - finalQuantity,

            status: faker.number.int({ min: 1, max: 4 }),
            createdAt: createdAt,
            processingDate: processingDate,
            processingDateInitial: processingDateInitial,
            processingDateFinal: processingDateFinal,

            processingTime: processingTime,
            processingTimeFinal: processingTimeFinal,
            processingTimeRate: processingTime / processingTimeFinal,
            processingTimeDifference: processingTimeFinal - processingTime,
            // processingDateRate: parseFloat(faker.finance.amount({ min: 0, max: 1, dec: 2 })),
            // processingDateRate: processingDateFinal ,


        });

        //console.log("order", order)

        try {
            await order.save();
            //console.log(`Order ${order.orderNumber} saved.`);
        } catch (error) {
            console.error("Error creating order:", error);
        }
    }
    //console.log(`${count} orders have been generated and saved in the database.`);
    mongoose.disconnect();
}

const NUM_ORDERS = 5000;
generateOrders(NUM_ORDERS);
