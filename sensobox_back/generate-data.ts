import * as dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { UserModel } from './src/auth/domain/schemas/user.schema';
import { OrderModel } from './src/order/domain/schemas/order.schema';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

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

async function generateTestUser() {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const testUser = new UserModel({
        name: 'Admin User',
        clientName: 'Test Client',
        companyName: 'Test Company',
        email: 'admin@test.com',
        role: 'admin',
        password: hashedPassword,
        contactName: 'Admin Contact',
        contactPhone: '+1234567890',
        contactEmail: 'contact@test.com',
    });

    try {
        const existingUser = await UserModel.findOne({ email: 'admin@test.com' });
        if (existingUser) {
            console.log('Test user already exists');
            return existingUser;
        }
        const savedUser = await testUser.save();
        console.log(`Test user created: admin@test.com / password123`);
        return savedUser;
    } catch (error) {
        console.error("Error creating test user:", error);
        throw error;
    }
}

async function generateUsers(count: number) {
    for (let i = 0; i < count; i++) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const newUser = new UserModel({
            name: faker.helpers.arrayElement(TechnicianNames),
            clientName: faker.helpers.arrayElement(limitedNames),
            companyName: faker.helpers.arrayElement(companyNames),
            email: faker.internet.email(),
            role: faker.helpers.arrayElement(['admin', 'technician', 'client']),
            password: hashedPassword,
            contactName: faker.person.fullName(),
            contactPhone: faker.phone.number(),
            contactEmail: faker.internet.email(),
        });

        try {
            await newUser.save();
        } catch (error) {
            console.error("Error during user creation:", error);
        }
    }
    console.log(`${count} users have been generated and saved.`);
}

async function generateOrders(count: number) {
    for (let i = 0; i < count; i++) {
        const createdAt = faker.date.between({
            from: new Date(new Date().getFullYear() - 5, 0, 1),
            to: new Date()
        });
        const processingDate = faker.date.between({
            from: new Date(new Date().getFullYear() - 2, new Date().getMonth(), new Date().getDate()),
            to: new Date()
        });
        
        const processingDateInitial = faker.date.between({
            from: processingDate,
            to: new Date(processingDate.getTime() + 2 * 30 * 24 * 60 * 60 * 1000)
        });
        
        const processingDateFinal = faker.date.between({
            from: processingDateInitial,
            to: new Date(processingDateInitial.getTime() + 2 * 30 * 24 * 60 * 60 * 1000)
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
        });

        try {
            await order.save();
        } catch (error) {
            console.error("Error creating order:", error);
        }
    }
    console.log(`${count} orders have been generated and saved.`);
}

async function main() {
    try {
        await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/sensobox');
        console.log('Connected to MongoDB');

        console.log('Creating test user...');
        await generateTestUser();

        console.log('Generating users...');
        await generateUsers(50);

        console.log('Generating orders...');
        await generateOrders(500);

        console.log('Data generation completed!');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();



