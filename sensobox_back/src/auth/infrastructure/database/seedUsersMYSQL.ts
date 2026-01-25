import { DataSource } from 'typeorm';
import { UserModel } from '../../domain/schemas/user.schema';
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
    entities: [UserModel],
    synchronize: true, // Be cautious with synchronize in production environments
});

async function generateUsers(x: number) {
    await AppDataSource.initialize();

    for (let i = 0; i < x; i++) {
        const user = new UserModel();
        user.name = faker.person.fullName();
        user.companyName = faker.company.name();
        user.email = faker.internet.email();
        user.role = faker.helpers.arrayElement(['admin', 'technician', 'client']);
        user.password = faker.internet.password(8); // Ensures password is at least 6 characters

        await AppDataSource.getRepository(UserModel).save(user);
    }

    //console.log(`${x} users have been generated and saved in the database.`);
}

const NUM_USERS = 500; // Adjust number of users to generate as needed
generateUsers(NUM_USERS).then(() => AppDataSource.destroy()).catch(err => console.error(err));
