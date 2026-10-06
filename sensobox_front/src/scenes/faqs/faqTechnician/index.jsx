import FaqList from "../../../components/FaqList";
const ITEMS = [
  ["¿Qué órdenes veo?", "Solo las que tienes asignadas, ordenadas por fecha prevista. Las nuevas aparecen en cuanto la oficina las da de alta."],
  ["¿Cómo empiezo una orden?", "Abre las acciones de la orden y elige «Iniciar orden». Anota las unidades de partida (hojas o metros que cargas en máquina) y la hora de inicio."],
  ["¿Cómo voy registrando lo producido?", "Con «Cantidad procesada» actualizas las unidades hechas hasta el momento. La oficina lo ve en el panel al instante, sin llamadas."],
  ["¿Cómo cierro una orden?", "Con «Finalizar orden»: unidades buenas y hora de fin. Sensobox calcula la merma y el tiempo real frente al previsto."],
  ["¿Dónde apunto el material?", "En «Material», con el largo, el ancho y el peso. Así queda registrado el consumo de cada trabajo."],
];
const FAQ = () => <FaqList subtitle="Técnicos de taller" items={ITEMS} />;
export default FAQ;
