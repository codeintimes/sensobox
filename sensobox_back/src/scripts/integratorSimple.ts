// const XLSX = require('xlsx');
// const { MongoClient } = require('mongodb');
// const fs = require('fs');
// const path = require('path');

// // Configuración de MongoDB
// const url = 'mongodb://localhost:27017';
// const dbName = 'sensobox';
// const collectionName = 'orders-test';

// // Leer el archivo JSON de configuración
// const configPath = path.join(__dirname, 'integrator-config.json');
// const mapping = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// // Función para leer el archivo XLSX y convertirlo a JSON
// const readExcelFile = (filePath, mapping) => {
//     const workbook = XLSX.readFile(filePath);
//     const sheetName = workbook.SheetNames[0]; // Leer la primera hoja
//     const worksheet = workbook.Sheets[sheetName];
//     const jsonData = XLSX.utils.sheet_to_json(worksheet);
//     return jsonData.map(item => {
//         const mappedItem = {};
//         Object.keys(mapping).forEach(column => {
//             if (item[column] !== undefined) {
//                 mappedItem[mapping[column]] = item[column];
//             }
//         });
//         return mappedItem;
//     });
// };

// // Función para insertar datos en MongoDB
// const insertDataToMongoDB = async (data) => {
//     const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

//     try {
//         await client.connect();
//         console.log("Conectado a MongoDB");

//         const db = client.db(dbName);
//         const collection = db.collection(collectionName);

//         // Insertar datos
//         const result = await collection.insertMany(data);
//         console.log(`${result.insertedCount} documentos insertados`);
//     } catch (error) {
//         console.error("Error al insertar datos en MongoDB:", error);
//     } finally {
//         await client.close();
//     }
// };

// // Función principal
// const main = async () => {
//     const ordersDir = path.join(__dirname, 'orders');
//     const excelFiles = fs.readdirSync(ordersDir).filter(file => file.endsWith('.xlsx'));
    
//     for (const file of excelFiles) {
//         const filePath = path.join(ordersDir, file);
//         console.log(`Procesando archivo: ${file}`);
        
//         const data = readExcelFile(filePath, mapping);
//         console.log("Datos leídos del archivo XLSX:", data);
    
//         await insertDataToMongoDB(data);
//     }
// };

// // Ejecutar la función principal
// main().catch(console.error);
