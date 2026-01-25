// // src/database/factories/order.factory.ts
// import { define } from 'typeorm-seeding';
// import { Order } from '../../domain/schemas/order.schema';
// import * as Faker from 'faker';

// define(Order, (faker: typeof Faker) => {
//   const order = new Order();
//   order.orderNumber = faker.datatype.uuid();
//   order.clientName = faker.company.companyName();
//   order.workName = faker.name.jobTitle();
//   order.workType = faker.name.workType();
//   order.productionQuantity = faker.datatype.number({ min: 1, max: 1000 });
//   order.colors = faker.commerce.color();
//   order.processes = faker.lorem.word();
//   order.specialFinishes = faker.lorem.words(3);
//   order.palletsNumber = faker.datatype.number({ min: 0, max: 50 });
//   order.technician = faker.name.findName();
//   order.processingDate = faker.date.past();
//   order.processingTime = faker.datatype.number({ min: 1, max: 10000 });
//   order.initialQuantity = faker.datatype.number({ min: 1, max: 1000 });
//   order.finalQuantity = faker.datatype.number({ min: 1, max: 1000 });
//   order.status = faker.datatype.number({ min: 1, max: 4 });
//   return order;
// });
