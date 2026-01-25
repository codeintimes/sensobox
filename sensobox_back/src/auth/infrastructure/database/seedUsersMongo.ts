const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
import { UserModel } from '../../domain/schemas/user.schema';
require('dotenv').config();

// Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/sensobox');
// mongoose.connect("mongodb+srv://ortirafael8:4Af3QWOC90uEbExk@cluster0.l7wwmea.mongodb.net/sensobox?retryWrites=true&w=majority&appName=Cluster0/sensobox");
import * as dotenv from 'dotenv';
dotenv.config();
mongoose.connect(process.env.MONGODB_URL, {});

// Define a Mongoose schema for users
// const userSchema = new mongoose.Schema({
//     email: {
//         type: String,
//         required: [true, 'Email must not be empty'],
//         unique: true,
//         validate: {
//             validator: function (email) {
//                 return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
//             },
//             message: props => `${props.value} is not a valid email address!`
//         }
//     },
//     name: {
//         type: String,
//         required: [true, 'Name must not be empty']
//     },
//     companyName: {
//         type: String,
//         required: [true, 'CompanyName must not be empty']
//     },
//     role: {
//         type: String,
//         required: [true, 'Role must not be empty']
//     },
//     password: {
//         type: String,
//         required: [true, 'Password must not be empty'],
//         minlength: [6, 'Password must be at least 6 characters long']
//     },
// }, {
//     timestamps: true,
//     collection: 'users'
// });

// const UserModel = mongoose.model('User', userSchema);
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
  

// Function to generate user data
async function generateUsers(count) {
    for (let i = 0; i < count; i++) {
        const newUser = new UserModel({
            name: faker.helpers.arrayElement(TechnicianNames), // Cambiado de faker.person.fullName() a faker.name.findName()
            clientName: faker.helpers.arrayElement(limitedNames),
            companyName: faker.helpers.arrayElement(companyNames), // Cambiado de faker.helpers.arrayElement(companyNames) a faker.helpers.randomize(companyNames)
            email: faker.internet.email(),
            role: faker.helpers.arrayElement(['admin', 'technician', 'client']), // Cambiado de faker.helpers.arrayElement(['admin', 'technician', 'client']) a faker.helpers.randomize(['admin', 'technician', 'client'])
            password: faker.internet.password(8),
            contactName: faker.person.fullName(), // Cambiado de faker.person.fullName() a faker.name.findName()
            contactPhone: faker.phone.number(),// Generar número de teléfono ficticio
            contactEmail: faker.internet.email(),
        });

        try {
            const savedUser = await newUser.save();
            //console.log(`User saved: ${savedUser.id}`);
        } catch (error) {
            console.error("Error during user creation:", error);
        }
    }
    //console.log(`${count} users have been generated and saved in the database.`);
}

const NUM_USERS = 500;
generateUsers(NUM_USERS)
    .then(() => mongoose.disconnect())
    .catch(err => console.error(err));
