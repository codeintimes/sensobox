// Versión rediseñada: solo fechas previstas de lo pendiente
// y en curso, con «+N más» por día, para que el mes se lea.
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
import esLocale from "@fullcalendar/core/locales/es";
import enGbLocale from "@fullcalendar/core/locales/en-gb";
import nlLocale from "@fullcalendar/core/locales/nl";
import deLocale from "@fullcalendar/core/locales/de";
import frLocale from "@fullcalendar/core/locales/fr";
import { currentLang } from "../../../i18n";
import { nf } from "../../../utils/format";

const FC_LOCALES = [esLocale, enGbLocale, nlLocale, deLocale, frLocale];

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
        response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });
      } else {
        const url = `${API_ORDERS.ORDERS}/company?companyName=${encodeURIComponent(companyName)}`;
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
        title: t('calendar.event.start', { n: order.orderNumber, client: order.clientName }),
        start: order.processingDateInitial,
        end: order.processingDateInitial,
        backgroundColor: '#10B981', borderColor: '#10B981',
        extendedProps: { ...order },
      },
      {
        id: `${order.orderNumber}-end`,
        title: t('calendar.event.end', { n: order.orderNumber, client: order.clientName }),
        start: order.processingDateFinal,
        end: order.processingDateFinal,
        backgroundColor: '#94A3B8', borderColor: '#94A3B8',
        extendedProps: { ...order },
      },
      {
        id: `${order.orderNumber}-processing`,
        title: t('calendar.event.planned', { n: order.orderNumber, client: order.clientName }),
        start: order.processingDate,
        end: order.processingDate,
        backgroundColor: '#6366F1', borderColor: '#6366F1',
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
            locales={FC_LOCALES}
            locale={currentLang() === "en" ? "en-gb" : currentLang()}
            height="75vh"
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            // headerToolbar={{
            //   left: "prev,next today",
            //   center: "title",
            //   right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
            // }}
            initialView="dayGridMonth"
            dayMaxEvents={3}
            moreLinkText={(n) => t('calendar.more', { n })}
            eventDisplay="block"
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
            {selectedEvent && t('order.numberLong', { n: selectedEvent.orderNumber })}
          </Typography>
          <Typography id="event-details-description" sx={{ mt: 2 }}>
            {t('orders.columns.orderNumber')}: {selectedEvent?.orderNumber}<br />
            {t('orders.columns.clientName')}: {selectedEvent?.clientName}<br />
            {t('orders.columns.companyName')}: {selectedEvent?.companyName}<br />
            {t('orders.columns.technician')}: {selectedEvent?.technician}<br />
            {t('orders.columns.workName')}: {selectedEvent?.workName}<br />
            {t('orders.columns.workType')}: {selectedEvent?.workType}<br />
            {t('orders.columns.productionQuantity')}: {nf(selectedEvent?.productionQuantity)}<br />
            {t('orders.columns.colors')}: {selectedEvent?.colors}<br />
            {t('orders.columns.processes')}: {selectedEvent?.processes}<br />
            {t('orders.columns.specialFinishes')}: {selectedEvent?.specialFinishes}<br />
            {t('orders.columns.palletsNumber')}: {selectedEvent?.palletsNumber || '—'}
          </Typography>
          <Button onClick={handleCloseModal} style={{ marginTop: 20 }}>{t('common.close')}</Button>
        </Paper>
      </Modal>
    </Box>
    </>
  );
};

export default Calendar;
