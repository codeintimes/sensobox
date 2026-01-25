import { Box, useTheme } from "@mui/material";
import Header from "../../../components/Header";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../../../theme";

const FAQ = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box m="20px">
      <Header title="Manual de usuario de administrador" subtitle="Manual para la utilización de la herramienta sensobox" />

      <Accordion >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Como gestionar los usuarios
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Existen 3 tipos de usuarios: Cliente, Técnico, Administrador <br></br><br></br>
            los cuales se acceden desde la barra superior a la derecha con los siguientes iconos:
          </Typography>
          <Box mt={2}>
            <img src="/assets/userTopbar.png" alt="Descripción de la imagen" style={{ width: '15%', height: 'auto' }} />
          </Box>
          <Typography>
            En cada uno de los 3 tipos de usuario puedes crear, editar y borrar cualquier usuario con lo siguientes iconos:
          </Typography>
          <Box mt={2}>
            <img src="/assets/manageClientsIcons.png" alt="Descripción de la imagen" style={{ width: '11%', height: 'auto' }} />
          </Box>
          <Typography>
            Además en cada solumna de la tabla en la cabecera puedes desplegar opciones para ordenar, filtrar o ocultar columnas para simplificar el analisis de datos.
          </Typography>
          <Box mt={2}>
            <img src="/assets/tableOptions.png" alt="Descripción de la imagen" style={{ width: '10%', height: 'auto' }} />
          </Box>
        </AccordionDetails>
      </Accordion>
      <Accordion >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Como gestionar ECO/Clientes
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Se puede gestionar el apartado ECO de los diferentes clientes apra mostrar cuando CO2 están evitando producir gracias a trabajar con nuestra empresa.
            <br></br>
            En la barrar superior a la derecha en el icono ECO:
          </Typography>
          <Box mt={2}>
            <img src="/assets/ecoIcon.png" alt="Descripción de la imagen" style={{ width: '5%', height: 'auto' }} />
          </Box>
          <Typography>
            Puedes acceder al panel de configuración ECO, y definir si se v aa mostrar la configuración ECO a un cliente y la cantidad de CO2 ahorrado pro cada unidad:
          </Typography>
          <Box mt={2}>
            <img src="/assets/ecoConfig.png" alt="Descripción de la imagen" style={{ width: '60%', height: 'auto' }} />
          </Box>
          <Typography>
            Con esta configuración podras definir los gr de CO2 evitados por el cliente y si quieres que el cliente pueda visualizar esta información o no.          </Typography>
          <Box mt={2}>
            <img src="/assets/bannerECO.png" alt="Descripción de la imagen" style={{ width: '60%', height: 'auto' }} />
          </Box>
        </AccordionDetails>
      </Accordion>
      <Accordion >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Como funciona el dashboard
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box mt={2}>
            <img src="/assets/dashboard.png" alt="Descripción de la imagen" style={{ width: '50%', height: 'auto' }} />
          </Box>
          <Typography>
          <br></br>
            En el dashboard existen los siguientes elementos: <br></br><br></br>
            - 4 elementos de estado: estos elementos muestran la cantidad de cajas producidas, la cantidad de pedidos, el tiempo de procesamiento de cada pedido y las perdidas del mes actual comparado con la media del mensual del año pasado.
            <br></br>
            - 1 gráfica que muestra la media semanal de pedidos del ultimo año
            <br></br>
            - 2 listado de pedidos, uno de pendientes y otro de finalizados
            <br></br>
            - 1 gráfico de tarta, donde se puede observar los 7 clientes con más pedidos y los 7 clientes que piden más cantidad de cajas
          </Typography>

        </AccordionDetails>
      </Accordion>
      <Accordion >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Como funcionan los pedidos
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>

          <Typography>
            Además en cada solumna de la tabla en la cabecera puedes desplegar opciones para ordenar, filtrar o ocultar columnas para simplificar el analisis de datos.
          </Typography>
          <Box mt={2}>
            <img src="/assets/tableOptions.png" alt="Descripción de la imagen" style={{ width: '10%', height: 'auto' }} />
          </Box>
        </AccordionDetails>
      </Accordion>
      <Accordion >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            The Final Question
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default FAQ;
