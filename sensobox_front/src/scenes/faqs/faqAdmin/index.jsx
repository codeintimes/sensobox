import FaqList from "../../../components/FaqList";
const ITEMS = [
  ["¿Cómo doy de alta una orden de producción?", "En «Órdenes», pulsa el botón «+». Indica el cliente, el trabajo, la cantidad, los procesos y acabados, el técnico responsable, la fecha prevista y las horas estimadas. El técnico la verá al momento en su lista."],
  ["¿Qué significa cada estado?", "Pendiente: aún no se ha empezado. En producción: el técnico ha registrado el inicio y va anotando lo producido. Terminada: con cantidades y tiempos finales. Enviada: ya ha salido hacia el cliente."],
  ["¿De dónde salen la merma y el desvío de tiempo?", "Al iniciar la orden el técnico anota las unidades de partida; al terminarla, las unidades buenas y la hora de fin. Sensobox calcula la merma (unidades perdidas) y compara las horas reales con las previstas."],
  ["¿Qué aparece en «Desviaciones»?", "Las órdenes terminadas con más de un 7 % de merma o que han tardado más de un 30 % de lo previsto. Sirve para detectar a tiempo una máquina, un material o un trabajo que se está desviando."],
  ["¿Puedo filtrar o exportar las órdenes?", "Sí. En la tabla de órdenes puedes buscar por número o cliente, filtrar por cualquier columna, elegir qué columnas ver y exportar a CSV para enviarlo a contabilidad."],
  ["¿Cómo añado un cliente o un técnico?", "Desde «Clientes» o «Técnicos», con el botón «+». Cada persona recibe su usuario y solo ve lo que le corresponde: el técnico, sus órdenes; el cliente, sus pedidos."],
];
const FAQ = () => <FaqList subtitle="Administración" items={ITEMS} />;
export default FAQ;
