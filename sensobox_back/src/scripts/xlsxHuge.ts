import { faker } from '@faker-js/faker';
import * as XLSXCreator from 'xlsx';
import * as fsCreator from 'fs';
import * as pathCreator from 'path';

// Configuración para generar datos de prueba
const NUM_RECORDS = 10000;  // Número de registros de prueba que deseas generar

// Función para generar un registro de prueba
const generateRecord = () => ({
  "Order Number": faker.number.int(),
  "Client Name": faker.company.name(),
  "Company Name": faker.company.name(),
  "Work Name": faker.commerce.productName(),
  "Work Type": faker.commerce.productAdjective(),
  "Production Quantity": faker.number.int({ min: 1, max: 5000 }),
  "Colors": faker.color.human(),
  "Processes": faker.hacker.adjective(),
  "Special Finishes": faker.commerce.productAdjective(),
  "Pallets Number": faker.number.int({ min: 1, max: 100 }),
  "Technician": `${faker.name.firstName()} ${faker.name.lastName()}`,
  "Processing Date": faker.date.past().toISOString(),
  "Processing Time": faker.number.int({ min: 1000, max: 10000 }),
  "Initial Quantity": faker.number.int({ min: 1, max: 5000 }),
  "Processing Date Initial": faker.date.past().toISOString(),
  "Final Quantity": faker.number.int({ min: 1, max: 5000 }),
  "Final Quantity Difference": faker.number.int({ min: 0, max: 1000 }),
  "Quantity Rate": faker.number.float({ min: 0, max: 1, precision: 0.0001 }),
  "Processing Date Final": faker.date.past().toISOString(),
  "Processing Time Final": faker.number.int({ min: 1000, max: 10000 }),
  "Processing Time Difference": faker.number.int({ min: 0, max: 1000 }),
  "Processing Time Rate": faker.number.float({ min: 0, max: 1, precision: 0.0001 }),
  "Material Weight": faker.number.int({ min: 1, max: 100 }),
  "Material Area": faker.number.int({ min: 1, max: 100 }),
  "Quantity Processed": faker.number.int({ min: 1, max: 5000 }),
  "Status": faker.number.int({ min: 1, max: 5 }),
  "Created At": faker.date.past().toISOString(),
  "Updated At": faker.date.past().toISOString()
});

// Generar datos de prueba
const data = [];
for (let i = 0; i < NUM_RECORDS; i++) {
  data.push(generateRecord());
}

// Crear un nuevo libro de trabajo
const worksheet = XLSXCreator.utils.json_to_sheet(data);
const workbook = XLSXCreator.utils.book_new();
XLSXCreator.utils.book_append_sheet(workbook, worksheet, "Sheet1");

// Obtener la ruta absoluta de la carpeta 'orders' desde la posición del script
const ordersDir = pathCreator.resolve(__dirname, 'orders');
const filePath = pathCreator.join(ordersDir, 'archivo_ejemplo.xlsx');

if (!fsCreator.existsSync(ordersDir)) {
  fsCreator.mkdirSync(ordersDir);
}

// Guardar el archivo XLSX
XLSXCreator.writeFile(workbook, filePath);

console.log(`Archivo XLSX creado en: ${filePath}`);
