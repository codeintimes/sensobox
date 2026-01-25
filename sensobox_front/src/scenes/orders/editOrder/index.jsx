import React from 'react';
import { Box, Button, TextField, Grid, IconButton } from '@mui/material';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { API_ORDERS } from '../../../config/config';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useParams } from "react-router-dom";
import { format } from 'date-fns';

const UpdateOrderForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const jwt = localStorage.getItem('jwtToken');
  const { id } = useParams();
  const order = location.state?.order || {};
console.log("444",order)
  const removeEmptyFields = (values) => {
    const cleanedData = {};
    Object.keys(values).forEach(key => {
      // Check for non-empty, non-null, and non-default values
      if (values[key] !== '' && values[key] !== null && values[key] !== 0) {
        cleanedData[key] = values[key];
      }
    });
    return cleanedData;
  };

  const handleSubmit = async (values) => {
    const filteredValues = removeEmptyFields(values);  // Filter out empty fields before sending
    console.log("filteredValues",filteredValues)
    try {
      const response = await axios.patch(`${API_ORDERS.ORDERS}/orderUpdate/${id}`, filteredValues, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }
      });
      if (response.status === 200) {
        // alert(t('updateOrders.messages.updateSuccess'));
        navigate(-1);
      } else {
        throw new Error('Failed to update the order');
      }
    } catch (error) {
      console.error('Failed to update order', error);
      alert(t('updateOrders.messages.updateFail') + ': ' + error.message);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const validationSchema = yup.object().shape({
    orderNumber: yup.number(),
    clientName: yup.string(),
    companyName: yup.string(),
    workName: yup.string(),
    workType: yup.string(),
    productionQuantity: yup.number().positive(t('validation.positive')),
    colors: yup.string(),
    processes: yup.string(),
    specialFinishes: yup.string(),
    palletsNumber: yup.number().min(0, t('validation.minZero')),
    technician: yup.string(),
    processingDate: yup.date(),
    processingTime: yup.number().min(0),
    materialWeight: yup.number().min(0),
    materialArea: yup.number().min(0),
    quantityProcessed: yup.number().min(0)
  });

  return (
    <Box m="20px">
      <Header title={t('updateOrders.title')} subtitle={t('updateOrders.subtitle')} actionElement={
        <IconButton onClick={handleGoBack}>
          <ArrowBackIcon />
        </IconButton>
      } />
      <Formik
        initialValues={{
          orderNumber: order.orderNumber || '',
          clientName: order.clientName || '',
          companyName: order.companyName || '',
          workName: order.workName || '',
          workType: order.workType || '',
          productionQuantity: order.productionQuantity || 0,
          colors: order.colors || '',
          processes: order.processes || '',
          specialFinishes: order.specialFinishes || '',
          palletsNumber: order.palletsNumber || 0,
          technician: order.technician || '',
          processingDate: order.processingDate ? order.processingDate.split('T')[0] : "",
          processingTime: order.processingTime || 0,
          materialWeight: order.materialWeight || 0,
          materialArea: order.materialArea || 0,
          quantityProcessed: order.quantityProcessed || 0
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {Object.keys(values).map(key => (
                <Grid item xs={12} sm={6} key={key}>
                  <TextField
                    fullWidth
                    label={t(`orders.columns.${key}`)}
                    name={key}
                    value={values[key]}
                    onChange={handleChange}
                    error={touched[key] && Boolean(errors[key])}
                    helperText={touched[key] && t(errors[key])}
                    type={key.includes('Date') ? 'date' : 'text'}
                    InputLabelProps={key.includes('Date') ? { shrink: true } : undefined}
                    sx={key.includes('Date') ? {
                      "& .MuiInputBase-input::-webkit-calendar-picker-indicator": {
                        filter: "invert(1)"
                      }
                    } : {}}
                  />
                </Grid>
              ))}
              <Grid item xs={12}>
                <Button type="submit" color="secondary" variant="contained">
                  {t('updateOrders.edit')}
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default UpdateOrderForm;
