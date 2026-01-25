import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  Box,
  Typography,
  useTheme,
  Button,
  Modal,
  Paper,
  useMediaQuery
} from "@mui/material";
import Header from "../../../components/Header";
import { tokens } from "../../../theme";
import { API_ORDERS } from "../../../config/config";
import { useTranslation } from "react-i18next";
import axios from 'axios';

const Calendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [orders, setOrders] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const isMobile = useMediaQuery('(max-width:800px)');
  const { t } = useTranslation();
  const loadOrders = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData')) || {};
      const companyName = userData.companyName;
      const clientName = userData.clientName;

      if (!companyName) {
        console.error("No se encontró el nombre de la compañía.");
        return;
      }

      if (!clientName) {
        console.error("No se encontró el nombre del cliente.");
        return;
      }

      const jwt = localStorage.getItem("jwtToken");
      let response;

      if (userData.role === 'client') {
        const url = `${API_ORDERS.ORDERS}/company?companyName=${encodeURIComponent(companyName)}&clientName=${encodeURIComponent(clientName)}`;
        console.log("URL construida:", url);
        response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });
      } else {
        const url = `${API_ORDERS.ORDERS}/company?companyName=${encodeURIComponent(companyName)}`;
        console.log("URL construida:", url);
        response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });        
      }

      const data = response.data;
      setOrders(data);
    } catch (error) {
      console.error("Error al cargar los datos: ", error.message);
    }
  };


  

  useEffect(() => {
    loadOrders();
  }, []);

  const formatEvents = (orders) => {
    return orders.map(order => [
      {
        id: `${order.orderNumber}-start`,
        title: `Inicio pedido: Nº ${order.orderNumber}`,
        start: order.processingDateInitial,
        end: order.processingDateInitial,
        backgroundColor: 'green',
        extendedProps: { ...order },
      },
      {
        id: `${order.orderNumber}-end`,
        title: `Fin pedido: Nº ${order.orderNumber}`,
        start: order.processingDateFinal,
        end: order.processingDateFinal,
        backgroundColor: 'red',
        extendedProps: { ...order },
      },
      {
        id: `${order.orderNumber}-processing`,
        title: `Fecha prevista: Nº ${order.orderNumber}`,
        start: order.processingDate,
        end: order.processingDate,
        backgroundColor: 'blue',
        extendedProps: { ...order },
      }
    ]).flat();
  };

  const handleEventClick = ({ event }) => {
    setSelectedEvent(event.extendedProps);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };
  const customHeaderStyle = `
    .fc-header-toolbar {
      font-size: ${isMobile ? '10px' : '18px'};
    }
  `;

  return (
    <>
    <style>{customHeaderStyle}</style>
    <Box m="20px" >
      <Header title={t('calendar.title')} subtitle={t('calendar.subtitle')} />

      <Box display="flex" justifyContent="space-between">
        {/* CALENDAR */}
        <Box
          flex="1 1 100%"
          ml={isMobile ? 0 : "15px"} // Eliminar margen a la izquierda en móvil
          p={isMobile ? 0 : "15px"} // Eliminar relleno en móvil
          borderRadius="4px"
          backgroundColor={colors.primary[400]}
        >
          <FullCalendar
          locale="es" // Establece el locale en español
            height="75vh"
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            // headerToolbar={{
            //   left: "prev,next today",
            //   center: "title",
            //   right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
            // }}
            initialView="dayGridMonth"
            events={formatEvents(orders)}
            eventClick={handleEventClick}
            views={{
              dayGridMonth: {
                titleFormat: { year: 'numeric', month: 'short' }, // Título más corto en móvil
              },
            }}
            headerToolbar={{
              left: isMobile ? 'prev,next' : 'prev,next today',
              center: isMobile ? 'title' : 'title',
              right: isMobile ? 'dayGridMonth,timeGridWeek,timeGridDay' : 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
            }}
            buttonText={{
              today: t('calendar.today'),
              month: t('calendar.month'),
              week: t('calendar.week'),
              day: t('calendar.day'),
              list: t('calendar.list'),
            }}

          />
        </Box>
      </Box>

      {/* MODAL TO DISPLAY EVENT DETAILS */}
      <Modal
        open={!!selectedEvent}
        onClose={handleCloseModal}
        aria-labelledby="event-details-title"
        aria-describedby="event-details-description"
      >
        <Paper style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: 20, maxWidth: 400, width: '80%' }}>
          <Typography id="event-details-title" variant="h6" component="h2">
            {selectedEvent?.title}
          </Typography>
          <Typography id="event-details-description" sx={{ mt: 2 }}>
            {t('orders.columns.orderNumber')}: {selectedEvent?.orderNumber}<br />
            {t('orders.columns.clientName')}: {selectedEvent?.clientName}<br />
            {t('orders.columns.companyName')}: {selectedEvent?.companyName}<br />
            {t('orders.columns.technician')}: {selectedEvent?.technician}<br />
            {t('orders.columns.workName')}: {selectedEvent?.workName}<br />
            {t('orders.columns.workType')}: {selectedEvent?.workType}<br />
            {t('orders.columns.productionQuantity')}: {selectedEvent?.productionQuantity}<br />
            {t('orders.columns.colors')}: {selectedEvent?.colors}<br />
            {t('orders.columns.processes')}: {selectedEvent?.processes}<br />
            {t('orders.columns.specialFinishes')}: {selectedEvent?.specialFinishes}<br />
            {t('orders.columns.palletsNumber')}: {selectedEvent?.palletsNumber || 'N/A'}
          </Typography>
          <Button onClick={handleCloseModal} style={{ marginTop: 20 }}>{t('common.close')}</Button>
        </Paper>
      </Modal>
    </Box>
    </>
  );
};

export default Calendar;
