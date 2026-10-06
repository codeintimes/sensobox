import FaqList from "../../../components/FaqList";
const ITEMS = [
  ["¿Qué veo en el portal?", "Tus pedidos y en qué punto está cada uno: pendiente, en producción, terminado o enviado, con las cantidades y fechas."],
  ["¿Cada cuánto se actualiza?", "En tiempo real: en cuanto el taller registra un avance, lo ves aquí."],
  ["¿Puedo ver mis pedidos por fechas?", "Sí. En «Calendario» tienes la fecha prevista de cada pedido y en «Pedidos por periodo» su evolución."],
  ["¿A quién pregunto por un pedido?", "A tu contacto habitual en el taller. Indícale el número de pedido que aparece en la lista."],
];
const FAQ = () => <FaqList subtitle="Clientes" items={ITEMS} />;
export default FAQ;
