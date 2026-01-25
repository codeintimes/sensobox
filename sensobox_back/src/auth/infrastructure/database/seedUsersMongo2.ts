import { DataSource } from 'typeorm';
import { UserModel } from '../../domain/schemas/user.schema';
import { faker } from '@faker-js/faker';
require('dotenv').config();

const AppDataSource = new DataSource({
    type: 'mongodb',
    url:"mongodb://localhost:27017/sensobox",
    useUnifiedTopology: true,
    logging: true,
    entities: [UserModel],
    synchronize: true,
});

const companyNames = Array.from({ length: 30 }, () => faker.company.name());

async function generateUsers(x: number) {
    try {
        await AppDataSource.initialize();
        //console.log("Connected to the database successfully.");
    } catch (error) {
        console.error("Error connecting to the database:", error);
        return; // Stop further execution in case of connection failure
    }
    
    try {
        for (let i = 0; i < x; i++) {
            const user = new UserModel();
            user.name = faker.person.fullName();
            user.companyName = faker.helpers.arrayElement(companyNames);
            user.email = faker.internet.email();
            user.role = faker.helpers.arrayElement(['admin', 'technician', 'client']);
            user.password = faker.internet.password(8);
    
            const savedUser = await AppDataSource.getMongoRepository(UserModel).save(user);
            //console.log(`User saved: ${savedUser.id}`);
        }
        //console.log(`${x} users have been generated and saved in the database.`);
    } catch (error) {
        console.error("Error during user creation:", error);
    }
}

const NUM_USERS = 500; // Adjust number of users to generate as needed
generateUsers(NUM_USERS)
    .then(() => AppDataSource.destroy())
    .catch(err => console.error(err));

