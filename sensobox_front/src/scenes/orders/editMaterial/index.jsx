import React from "react";
import { Box, Button, TextField, IconButton } from "@mui/material";
import { Formik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import * as yup from "yup";
import Header from "../../../components/Header";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTranslation } from 'react-i18next';
import {API_ORDERS} from "../../../config/config";
import axios from 'axios';
import { useParams } from "react-router-dom";

const EditMaterial = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order || {};
  const { t } = useTranslation();
  const { id } = useParams();

  const handleFormSubmit = async (values) => {
    const area = (values.length * values.width).toFixed(2);
    const weight = parseFloat(values.weight).toFixed(2);

    try {
      const jwt = localStorage.getItem("jwtToken")
      const response = await axios.patch(`${API_ORDERS.ORDERS}/material-info/${id}`, {
        materialArea: area,
        materialWeight: weight,
        orderId: order._id
      }, {
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
      console.error(t('orders.material.update_fail'), error);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const initialValues = {
    length: 0,
    width: 0,
    weight: 0,
  };

  const validationSchema = yup.object({
    length: yup.number().required(t('orders.material.length_required')).positive(t('orders.material.length_positive')),
    width: yup.number().required(t('orders.material.width_required')).positive(t('orders.material.width_positive')),
    weight: yup.number().required(t('orders.material.weight_required')).positive(t('orders.material.weight_positive')),
  });

  return (
    <Box m="20px">
      <Header title={t('orders.material.update_material_area')} subtitle={t('orders.material.update_area_subtitle', { orderNumber: order.orderNumber })} actionElement={
          <IconButton onClick={handleGoBack}>
            <ArrowBackIcon />
          </IconButton>
        }/>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleFormSubmit}>
        {({ values, errors, touched, handleChange, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap="20px">
              <TextField
                fullWidth
                variant="outlined"
                label={t('orders.material.length_meters')}
                name="length"
                type="number"
                value={values.length}
                onChange={handleChange}
                error={touched.length && Boolean(errors.length)}
                helperText={touched.length && errors.length}
              />
              <TextField
                fullWidth
                variant="outlined"
                label={t('orders.material.width_meters')}
                name="width"
                type="number"
                value={values.width}
                onChange={handleChange}
                error={touched.width && Boolean(errors.width)}
                helperText={touched.width && errors.width}
              />
              <TextField
                fullWidth
                variant="outlined"
                label={t('orders.material.weight_kg')}
                name="weight"
                type="number"
                value={values.weight}
                onChange={handleChange}
                error={touched.weight && Boolean(errors.weight)}
                helperText={touched.weight && errors.weight}
              />
              <Box>
                {t('orders.material.calculated_area')}: {(values.length * values.width).toFixed(2)} m²
              </Box>

              <Box display="flex" justifyContent="flex-end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                {t('orders.material.submit_area_weight_order_id')}
              </Button>
              </Box>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default EditMaterial;
