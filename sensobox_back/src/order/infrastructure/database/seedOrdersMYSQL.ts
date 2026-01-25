import { DataSource } from 'typeorm';
import { OrderModel } from '../../domain/schemas/order.schema';
import { faker } from '@faker-js/faker';
require('dotenv').config();

const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.MYSQL_HOST, 
    port: parseInt(process.env.MYSQL_PORT, 10), 
    username: process.env.MYSQL_USERNAME, 
    password: process.env.MYSQL_PASSWORD, 
    database: process.env.MYSQL_DATABASE, 
    logging: true,
    entities: [OrderModel],
    synchronize: true,
});

const clientNames = Array.from({ length: 30 }, () => faker.company.name());
const companyNames = Array.from({ length: 30 }, () => faker.company.name());


async function generateOrders(x: number) {
    await AppDataSource.initialize();

    for (let i = 0; i < x; i++) {
        const order = new OrderModel();
        order.orderNumber = faker.datatype.number({ min: 100000, max: 999999 });
        order.clientName = faker.helpers.arrayElement(clientNames);
        order.companyName = faker.helpers.arrayElement(companyNames);
        order.workName = faker.commerce.productName();
        order.workType = faker.commerce.productMaterial();
        order.productionQuantity = faker.datatype.number({ min: 1, max: 100 });
        order.colors = faker.color.rgb();
        order.processes = faker.commerce.productAdjective();
        order.specialFinishes = faker.commerce.productMaterial();
        order.palletsNumber = faker.datatype.number({ min: 0, max: 20 });
        order.technician = faker.name.fullName();
        order.initialQuantity = faker.datatype.number({ min: 1, max: 100 });
        order.finalQuantity = faker.datatype.number({ min: 1, max: 100 });
        order.quantityRate = parseFloat(faker.finance.amount(0, 1, 2));
        order.processingTimeRate = parseFloat(faker.finance.amount(0, 1, 2));
        order.status = faker.datatype.number({ min: 1, max: 4 });

        // Generate random dates
        const createdAt = faker.date.between(new Date(new Date().getFullYear() - 5, 0, 1), new Date());
        order.createdAt = createdAt;
        order.processingDate = faker.date.between(createdAt, new Date());
        order.processingDateInitial = faker.date.between(new Date(new Date().getFullYear() - 5, 0, 1), createdAt);
        order.processingDateFinal = faker.date.between(order.processingDateInitial, new Date());
        
        // Simulate processing time in hours
        order.processingTime = faker.datatype.number({ min: 4000, max: 654000 });
        // order.processingDateRate = parseFloat(faker.finance.amount(0, 1, 2));
        order.processingTimeFinal = faker.datatype.number({ min: 54000, max: 654000 });
        order.finalQuantityDifference = order.initialQuantity - order.finalQuantity; // Calculate difference in quantity
        order.processingTimeDifference = order.processingTimeFinal - order.processingTime; // Assuming 'processingTime' is already defined
 
        await AppDataSource.getRepository(OrderModel).save(order);
    }

    //console.log(`${x} orders have been generated and saved in the database.`);
}

const NUM_ORDERS = 5000;
generateOrders(NUM_ORDERS).then(() => AppDataSource.destroy());
