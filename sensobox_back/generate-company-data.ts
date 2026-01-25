import * as dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { UserModel } from './src/auth/domain/schemas/user.schema';
import { OrderModel } from './src/order/domain/schemas/order.schema';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const COMPANY_NAME = 'TEST COMPANY';

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

async function generateUsersForCompany() {
    console.log('Generating users for TEST COMPANY...');
    
    // Generar clientes
    for (let i = 0; i < 10; i++) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const clientName = faker.helpers.arrayElement(limitedNames);
        const newUser = new UserModel({
            name: faker.person.fullName(),
            clientName: clientName,
            companyName: COMPANY_NAME,
            email: `client${i}@testcompany.com`,
            role: 'client',
            password: hashedPassword,
            contactName: faker.person.fullName(),
            contactPhone: faker.phone.number(),
            contactEmail: faker.internet.email(),
            eco: faker.datatype.boolean(),
            ecoEmissions: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
        });

        try {
            await newUser.save();
        } catch (error) {
            if (error.code !== 11000) { // Ignorar duplicados
                console.error("Error creating client:", error);
            }
        }
    }

    // Generar técnicos
    for (let i = 0; i < 8; i++) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const newUser = new UserModel({
            name: faker.helpers.arrayElement(TechnicianNames),
            clientName: 'N/A',
            companyName: COMPANY_NAME,
            email: `technician${i}@testcompany.com`,
            role: 'technician',
            password: hashedPassword,
            contactName: faker.person.fullName(),
            contactPhone: faker.phone.number(),
            contactEmail: faker.internet.email(),
        });

        try {
            await newUser.save();
        } catch (error) {
            if (error.code !== 11000) {
                console.error("Error creating technician:", error);
            }
        }
    }

    // Generar más admins
    for (let i = 0; i < 3; i++) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const newUser = new UserModel({
            name: faker.person.fullName(),
            clientName: 'N/A',
            companyName: COMPANY_NAME,
            email: `admin${i}@testcompany.com`,
            role: 'admin',
            password: hashedPassword,
            contactName: faker.person.fullName(),
            contactPhone: faker.phone.number(),
            contactEmail: faker.internet.email(),
        });

        try {
            await newUser.save();
        } catch (error) {
            if (error.code !== 11000) {
                console.error("Error creating admin:", error);
            }
        }
    }

    console.log('Users generated successfully');
}

async function generateOrdersForCompany() {
    console.log('Generating orders for TEST COMPANY...');
    
    // Obtener usuarios de la compañía para usar sus nombres
    const companyUsers = await UserModel.find({ companyName: COMPANY_NAME });
    const clientNames = companyUsers.filter(u => u.role === 'client').map(u => u.clientName);
    const technicianNames = companyUsers.filter(u => u.role === 'technician').map(u => u.name);
    
    // Si no hay clientes, usar los nombres por defecto
    const finalClientNames = clientNames.length > 0 ? clientNames : limitedNames;
    const finalTechnicianNames = technicianNames.length > 0 ? technicianNames : TechnicianNames;

    // Generar órdenes distribuidas en los últimos 12 meses
    const now = new Date();
    const orders = [];

    for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
        const monthDate = new Date(now);
        monthDate.setMonth(monthDate.getMonth() - monthOffset);
        
        // Generar entre 20-50 órdenes por mes
        const ordersPerMonth = faker.number.int({ min: 20, max: 50 });
        
        for (let i = 0; i < ordersPerMonth; i++) {
            // Fecha de creación dentro del mes
            const createdAt = faker.date.between({
                from: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
                to: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
            });

            // Fechas de procesamiento
            const processingDate = faker.date.between({
                from: createdAt,
                to: new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000) // Hasta 30 días después
            });

            const processingDateInitial = faker.date.between({
                from: processingDate,
                to: new Date(processingDate.getTime() + 15 * 24 * 60 * 60 * 1000)
            });

            const processingDateFinal = faker.date.between({
                from: processingDateInitial,
                to: new Date(processingDateInitial.getTime() + 20 * 24 * 60 * 60 * 1000)
            });

            const productionQuantity = faker.number.int({ min: 1000, max: 15000 });
            const initialQuantity = productionQuantity + faker.number.int({ min: 100, max: 1500 });
            const finalQuantity = productionQuantity + faker.number.int({ min: 10, max: 200 });
            const processingTime = faker.number.int({ min: 3000, max: 6000 });
            const processingTimeFinal = processingTime + faker.number.int({ min: 0, max: 1500 });

            const order = {
                orderNumber: faker.number.int({ min: 100000, max: 999999 }),
                clientName: faker.helpers.arrayElement(finalClientNames),
                companyName: COMPANY_NAME,
                workName: faker.commerce.productName(),
                workType: faker.commerce.productMaterial(),
                productionQuantity: productionQuantity,
                colors: faker.color.rgb(),
                processes: faker.commerce.productAdjective(),
                specialFinishes: faker.commerce.productMaterial(),
                palletsNumber: faker.number.int({ min: 1, max: 25 }),
                materialArea: faker.number.float({ min: 10, max: 100, fractionDigits: 2 }),
                materialWeight: faker.number.float({ min: 5, max: 50, fractionDigits: 2 }),
                quantityProcessed: Math.round(productionQuantity * faker.number.float({ min: 0.5, max: 1 })),
                technician: faker.helpers.arrayElement(finalTechnicianNames),
                initialQuantity: initialQuantity,
                finalQuantity: finalQuantity,
                quantityRate: finalQuantity / initialQuantity,
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
            };

            orders.push(order);
        }
    }

    // Insertar órdenes en lotes
    const batchSize = 100;
    for (let i = 0; i < orders.length; i += batchSize) {
        const batch = orders.slice(i, i + batchSize);
        try {
            await OrderModel.insertMany(batch, { ordered: false });
            console.log(`Inserted ${Math.min(i + batchSize, orders.length)}/${orders.length} orders`);
        } catch (error) {
            console.error(`Error inserting batch ${i}-${i + batchSize}:`, error.message);
        }
    }

    console.log(`Generated ${orders.length} orders for TEST COMPANY`);
}

async function main() {
    try {
        await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/sensobox');
        console.log('Connected to MongoDB');

        // Limpiar datos existentes de TEST COMPANY (opcional, comentar si quieres mantener datos anteriores)
        // await OrderModel.deleteMany({ companyName: COMPANY_NAME });
        // await UserModel.deleteMany({ companyName: COMPANY_NAME, email: { $ne: 'admin@test.com' } });

        await generateUsersForCompany();
        await generateOrdersForCompany();

        console.log('\n✅ Data generation completed successfully!');
        console.log(`\n📊 Summary:`);
        const userCount = await UserModel.countDocuments({ companyName: COMPANY_NAME });
        const orderCount = await OrderModel.countDocuments({ companyName: COMPANY_NAME });
        console.log(`   - Users: ${userCount}`);
        console.log(`   - Orders: ${orderCount}`);
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();



