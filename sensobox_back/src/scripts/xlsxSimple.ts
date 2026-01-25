// const XLSXCreator = require('xlsx');
// const fsCreator = require('fs');
// const pathCreator = require('path');

// // Datos de ejemplo
// const data = [
//   {
//     "Order Number": 510778,
//     "Client Name": "Earthwise Logistics",
//     "Company Name": "SolidBox Enterprises",
//     "Work Name": "Fantastic Fresh Bike",
//     "Work Type": "Frozen",
//     "Production Quantity": 1468,
//     "Colors": "#c9aebe",
//     "Processes": "Luxurious",
//     "Special Finishes": "Frozen",
//     "Pallets Number": 11,
//     "Technician": "Alex Castro",
//     "Processing Date": "2023-11-30T05:29:04.679Z",
//     "Processing Time": 4882,
//     "Initial Quantity": 2203,
//     "Processing Date Initial": "2023-12-05T22:01:49.183Z",
//     "Final Quantity": 1552,
//     "Final Quantity Difference": 651,
//     "Quantity Rate": 0.7044938719927372,
//     "Processing Date Final": "2023-12-24T14:44:03.036Z",
//     "Processing Time Final": 5027,
//     "Processing Time Difference": 145,
//     "Processing Time Rate": 0.9711557589019296,
//     "Material Weight": 6,
//     "Material Area": 11,
//     "Quantity Processed": 195,
//     "Status": 3,
//     "Created At": "2022-06-07T00:26:54.240Z",
//     "Updated At": "2022-06-07T00:26:54.240Z"
//   },
//   {
//     "Order Number": 510779,
//     "Client Name": "Another Client",
//     "Company Name": "Another Company",
//     "Work Name": "Another Work",
//     "Work Type": "Type",
//     "Production Quantity": 1500,
//     "Colors": "#ffffff",
//     "Processes": "Process",
//     "Special Finishes": "Finish",
//     "Pallets Number": 10,
//     "Technician": "Another Technician",
//     "Processing Date": "2023-11-30T05:29:04.679Z",
//     "Processing Time": 5000,
//     "Initial Quantity": 2200,
//     "Processing Date Initial": "2023-12-05T22:01:49.183Z",
//     "Final Quantity": 1600,
//     "Final Quantity Difference": 600,
//     "Quantity Rate": 0.7272727272727273,
//     "Processing Date Final": "2023-12-24T14:44:03.036Z",
//     "Processing Time Final": 5050,
//     "Processing Time Difference": 50,
//     "Processing Time Rate": 0.99,
//     "Material Weight": 7,
//     "Material Area": 12,
//     "Quantity Processed": 190,
//     "Status": 2,
//     "Created At": "2022-06-07T00:26:54.240Z",
//     "Updated At": "2022-06-07T00:26:54.240Z"
//   }
// ];

// // Crear un nuevo libro de trabajo
// const worksheet = XLSXCreator.utils.json_to_sheet(data);
// const workbook = XLSXCreator.utils.book_new();
// XLSXCreator.utils.book_append_sheet(workbook, worksheet, "Sheet1");

// // Obtener la ruta absoluta de la carpeta 'orders' desde la posición del script
// const ordersDir = pathCreator.resolve(__dirname, 'orders');
// const filePath = pathCreator.join(ordersDir, 'archivo_ejemplo.xlsx');

// if (!fsCreator.existsSync(ordersDir)) {
//   fsCreator.mkdirSync(ordersDir);
// }

// // Guardar el archivo XLSXCreator
// XLSXCreator.writeFile(workbook, filePath);

// console.log(`Archivo XLSXCreator creado en: ${filePath}`);
