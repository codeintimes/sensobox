const ExcelJS = require('exceljs');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Configuración de MongoDB
const url = 'mongodb://localhost:27017';
const dbName = 'sensobox';
const collectionName = 'orders-test';

// Leer el archivo JSON de configuración
const configPath = path.join(__dirname, 'integrator-config.json');
const mapping = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Función para procesar y mapear cada fila del archivo Excel
const mapRow = (row, mapping) => {
    const mappedItem = {};
    Object.keys(mapping).forEach(column => {
        if (row[column] !== undefined) {
            mappedItem[mapping[column]] = row[column];
        }
    });
    return mappedItem;
};

// Función para insertar datos en MongoDB
const insertDataToMongoDB = async (data) => {
    const client = new MongoClient(url);

    try {
        await client.connect();
        console.log("Conectado a MongoDB");

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Insertar datos
        const result = await collection.insertMany(data);
        console.log(`${result.insertedCount} documentos insertados`);
    } catch (error) {
        console.error("Error al insertar datos en MongoDB:", error);
    } finally {
        await client.close();
    }
};

// Función principal
const main = async () => {
    const ordersDir = path.join(__dirname, 'orders');
    const excelFiles = fs.readdirSync(ordersDir).filter(file => file.endsWith('.xlsx'));

    for (const file of excelFiles) {
        const filePath = path.join(ordersDir, file);
        console.log(`Procesando archivo: ${file}`);

        const data = [];
        const workbook = new ExcelJS.Workbook();

        await workbook.xlsx.readFile(filePath);

        const worksheet = workbook.worksheets[0];

        // Leer el encabezado
        const header = [];
        worksheet.getRow(1).eachCell((cell, colNumber) => {
            header[colNumber] = cell.text;
        });

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) {
                // Skip header row
                return;
            }
            const rowValues = {};
            row.eachCell((cell, colNumber) => {
                const columnName = header[colNumber];
                rowValues[columnName] = cell.value;
            });

            const mappedRow = mapRow(rowValues, mapping);
            data.push(mappedRow);
        });

        console.log(`Datos leídos del archivo XLSX: ${file}`, data);
        await insertDataToMongoDB(data);
    }
};

// Ejecutar la función principal
main().catch(console.error);
