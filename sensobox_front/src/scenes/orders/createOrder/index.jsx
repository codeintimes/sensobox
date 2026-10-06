// Versión rediseñada: tarjeta, técnico como desplegable
// y fecha prevista con hora.
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import { tokens } from "../../../theme";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTranslation } from "react-i18next";
import axios from 'axios';
import React, { useState, useEffect } from "react"; // Asegúrate de importar useState y useEffect
import { Box, Button, TextField, useTheme, InputLabel, Select, MenuItem, IconButton, Grid, FormControl } from "@mui/material"; // Importar FormControl y MenuItem
import { API_ORDERS, API_USERS } from "../../../config/config"; // Importar API_USERS


const CreateOrderForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();
  const userData = JSON.parse(localStorage.getItem('userData'));
  const [clients, setClients] = useState([]);
  const [techs, setTechs] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    axios.get(`${API_USERS.USERS}/clientRole`, { params: { role: 'technician', companyName: userData?.companyName }, headers: { 'Authorization': `Bearer ${token}` } })
      .then((r) => setTechs([...new Set(r.data.map((u) => u.name))].sort()))
      .catch((e) => console.error(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getClients = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const companyName = userData ? userData.companyName : '';

      if (!companyName) {
        console.error("No se encontró el nombre de la compañía.");
        return [];
      }

      const response = await axios.get(`${API_USERS.USERS}/clientRole`, {
        params: { role: 'client', companyName: companyName },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const uniqueClients = [...new Set(response.data.map(client => client.clientName))];
      return uniqueClients;
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchClients = async () => {
      const fetchedClients = await getClients();
      setClients(fetchedClients);
    };

    fetchClients();
  }, []);

  const handleSubmit = async (values) => {
    try {
      const jwt = localStorage.getItem("jwtToken");
      // Assuming user data is stored as JSON
      const companyName = userData ? userData.companyName : ''; // Ensure there's a fallback

      if (!companyName) {
        alert(t('createOrder.messages.companyNameMissing'));
        return;
      }

      // Add companyName to the values object before sending
      const payload = {
        ...values,
        companyName: companyName // Include companyName in the payload
      };

      const response = await axios.post(`${API_ORDERS.ORDERS}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }
      });

      console.log("Order created successfully:", response);
      navigate(-1);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert(t('createOrder.messages.orderNumberExists'));
      } else {
        console.error("Failed to create order", error);
        alert(t('createOrder.messages.createFail') + ": " + error.message);
      }
    }
  };


  const handleGoBack = () => {
    navigate(-1);
  };
  const initialValues = {
    orderNumber: '',
    clientName: '',
    workName: '',
    workType: '',
    productionQuantity: 0,
    colors: '',
    processes: '',
    specialFinishes: '',
    palletsNumber: 0,
    technician: userData && userData.role === 'technician' ? userData.name : '',
    processingDate: '',
    processingTime: 0,
  };

  const validationSchema = yup.object().shape({
    orderNumber: yup.number().required(t("validation.required")),
    clientName: yup.string().required(t("validation.required")),
    workName: yup.string().required(t("validation.required")),
    workType: yup.string().required(t("validation.required")),
    productionQuantity: yup.number().required(t("validation.required")).positive(t("validation.positive")).integer(),
    colors: yup.string().required(t("validation.required")),
    processes: yup.string().required(t("validation.required")),
    specialFinishes: yup.string().required(t("validation.required")),
    palletsNumber: yup.number().required(t("validation.required")).min(0, t("validation.minZero")).integer(),
    technician: yup.string().required(t("validation.required")),
    processingDate: yup.date().required(t("validation.required")),
    processingTime: yup.number().required(t("validation.required")).min(0, t("validation.minZero")).integer(),
  });


  return (
    <Box sx={{ p: { xs: "16px", md: "24px 28px" }, maxWidth: 1180 }}>
      <Header title={t("createOrder.title")} subtitle={t("createOrder.subtitle")} actionElement={
        <IconButton onClick={handleGoBack}>
          <ArrowBackIcon />
        </IconButton>
      } />
      <Box className="sb-card sb-form" sx={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", p: { xs: "16px", md: "24px" } }}>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, errors, touched, handleChange, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t("createOrder.form.orderNumber")}
                  name="orderNumber"
                  type="number"
                  value={values.orderNumber}
                  onChange={handleChange}
                  error={touched.orderNumber && Boolean(errors.orderNumber)}
                  helperText={touched.orderNumber && errors.orderNumber}
                  inputProps={{ min: 0 }} // Optionally enforce non-negative numbers
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t("createOrder.form.clientName")}</InputLabel>
                  <Select
                    label={t("createOrder.form.clientName")}
                    name="clientName"
                    value={values.clientName}
                    onChange={handleChange}
                    error={touched.clientName && Boolean(errors.clientName)}
                  >
                    {clients.map(client => (
                      <MenuItem key={client} value={client}>
                        {client}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t("createOrder.form.workName")}
                  name="workName"
                  value={values.workName}
                  onChange={handleChange}
                  error={touched.workName && Boolean(errors.workName)}
                  helperText={touched.workName && errors.workName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t("createOrder.form.workType")}
                  name="workType"
                  value={values.workType}
                  onChange={handleChange}
                  error={touched.workType && Boolean(errors.workType)}
                  helperText={touched.workType && errors.workType}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t("createOrder.form.productionQuantity")}
                  name="productionQuantity"
                  type="number"
                  value={values.productionQuantity}
                  onChange={handleChange}
                  error={touched.productionQuantity && Boolean(errors.productionQuantity)}
                  helperText={touched.productionQuantity && errors.productionQuantity}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t("createOrder.form.colors")}
                  name="colors"
                  value={values.colors}
                  onChange={handleChange}
                  error={touched.colors && Boolean(errors.colors)}
                  helperText={touched.colors && errors.colors}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t("createOrder.form.processes")}
                  name="processes"
                  value={values.processes}
                  onChange={handleChange}
                  error={touched.processes && Boolean(errors.processes)}
                  helperText={touched.processes && errors.processes}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t("createOrder.form.specialFinishes")}
                  name="specialFinishes"
                  value={values.specialFinishes}
                  onChange={handleChange}
                  error={touched.specialFinishes && Boolean(errors.specialFinishes)}
                  helperText={touched.specialFinishes && errors.specialFinishes}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t("createOrder.form.palletsNumber")}
                  name="palletsNumber"
                  type="number"
                  value={values.palletsNumber}
                  onChange={handleChange}
                  error={touched.palletsNumber && Boolean(errors.palletsNumber)}
                  helperText={touched.palletsNumber && errors.palletsNumber}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label={t("createOrder.form.technician")}
                  name="technician"
                  value={values.technician}
                  onChange={handleChange}
                  error={touched.technician && Boolean(errors.technician)}
                  helperText={touched.technician && errors.technician}
                >
                  {(techs.includes(values.technician) || !values.technician ? techs : [values.technician, ...techs]).map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label={t("createOrder.form.processingDate")}
                  name="processingDate"
                  value={values.processingDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  error={touched.processingDate && Boolean(errors.processingDate)}
                  helperText={touched.processingDate && errors.processingDate}
                  sx={{
                    'input[type="date"]::-webkit-calendar-picker-indicator': {
                      opacity: 0.6
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t("createOrder.form.processingTime")}
                  name="processingTime"
                  type="number"
                  value={values.processingTime}
                  onChange={handleChange}
                  error={touched.processingTime && Boolean(errors.processingTime)}
                  helperText={touched.processingTime && errors.processingTime}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="right" mt={2}>
                  <Button
                    color="secondary"
                    variant="contained"
                    type="submit"
                  >
                    {t("createOrder.form.createOrderButton")}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
      </Box>
    </Box>
  );
};

export default CreateOrderForm;
