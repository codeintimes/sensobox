import { DataSource } from 'typeorm';
import { OrderModel } from '../../domain/schemas/order.schema';
import { faker } from '@faker-js/faker';
import { Decimal128 } from 'mongoose';

require('dotenv').config();

const AppDataSource = new DataSource({
    type: 'mongodb',
    url:"mongodb://localhost:27017/sensobox",
    useUnifiedTopology: true,
    logging: true,
    entities: [OrderModel],
    synchronize: true,
});

const clientNames = Array.from({ length: 30 }, () => faker.company.name());
const companyNames = Array.from({ length: 30 }, () => faker.company.name());

async function generateOrders(x: number) {
    try {
        await AppDataSource.initialize();
        //console.log("Database connected successfully.");
    } catch (error) {
        console.error("Failed to connect to the database:", error);
        return; // Exit if the database connection fails
    }

    try {
        for (let i = 0; i < x; i++) {
            const order = new OrderModel();
            order.orderNumber = faker.number.int({ min: 100000, max: 999999 });
            order.clientName = faker.helpers.arrayElement(clientNames);
            order.companyName = faker.helpers.arrayElement(companyNames);
            order.workName = faker.commerce.productName();
            order.workType = faker.commerce.productMaterial();
            order.productionQuantity = faker.number.int({ min: 1, max: 100 });
            order.colors = faker.color.rgb();
            order.processes = faker.commerce.productAdjective();
            order.specialFinishes = faker.commerce.productMaterial();
            order.palletsNumber = faker.number.int({ min: 0, max: 20 });
            order.technician = faker.person.fullName();
            order.initialQuantity = faker.number.int({ min: 1, max: 100 });
            order.finalQuantity = faker.number.int({ min: 1, max: 100 });
            order.quantityRate = parseFloat(faker.finance.amount({ min: 0, max: 1, dec: 2 }));
            order.processingTimeRate = parseFloat(faker.finance.amount({ min: 0, max: 1, dec: 2 }));
            order.status = faker.number.int({ min: 1, max: 4 });

            const createdAt = faker.date.between({ from: new Date(new Date().getFullYear() - 5, 0, 1), to: new Date() });
            order.createdAt = createdAt;
            order.processingDate = faker.date.between({ from: createdAt, to: new Date() });
            order.processingDateInitial = faker.date.between({ from: new Date(new Date().getFullYear() - 5, 0, 1), to: createdAt });
            order.processingDateFinal = faker.date.between({ from: order.processingDateInitial, to: new Date() });

            order.processingTime = faker.number.int({ min: 12093654000, max: 92093654000 });
            // order.processingDateRate = parseFloat(faker.finance.amount({ min: 0, max: 1, dec: 2 }));
            // Simulate processing time in hours
            order.processingTimeFinal = faker.number.int({ min: 54000, max: 654000 });
            order.finalQuantityDifference = order.initialQuantity - order.finalQuantity; // Calculate difference in quantity
            order.processingTimeDifference = order.processingTimeFinal - order.processingTime; // Assuming 'processingTime' is already defined
     
            await AppDataSource.getRepository(OrderModel).save(order);
        }

        //console.log(`${x} orders have been generated and saved in the database.`);
        await AppDataSource.destroy();
    } catch (error) {
        console.error("Failed to create orders:", error);
    }
}

const NUM_ORDERS = 5000;
generateOrders(NUM_ORDERS);
