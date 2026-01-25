import React from "react";
import { Box, Button, TextField, IconButton } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { API_ORDERS } from "../../../config/config";
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useParams } from "react-router-dom";

const OpiInitialForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order || {};
  const { id } = useParams();
  const { t } = useTranslation();


  const handleFormSubmit = async (values) => {
    console.log("values",values)
    try {
      const jwt = localStorage.getItem("jwtToken")
      const response = await axios.patch(`${API_ORDERS.ORDERS}/initial/${id}`, values, {
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
      console.error("Failed to update OPI initial", error);
    }
  };
  const handleGoBack = () => {

    navigate(-1);
  };
  const initialValues = {
    initialQuantity: order.initialQuantity || 0,
    processingDateInitial: order.processingDateInitial ? order.processingDateInitial.split('T')[0] : "",
  };

  const validationSchema = yup.object({
    initialQuantity: yup.number()
      .required(t("opiInitialForm.labels.initialQuantity"))
      .positive(t("opiInitialForm.errors.initialQuantityPositive")),
    processingDateInitial: yup.date()
      .required(t("opiInitialForm.labels.processingDateInitial"))
      .typeError(t("opiInitialForm.errors.processingDateInitialType")),
  });


  return (
    <Box m="20px">
      <Header title={t("opiInitialForm.title")} subtitle={t("opiInitialForm.subtitle")} actionElement={
        <IconButton onClick={handleGoBack}>
          <ArrowBackIcon />
        </IconButton>
      } />
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleFormSubmit}>
        {({ values, errors, touched, handleChange, handleSubmit, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap="20px">
              <TextField
                fullWidth
                variant="outlined"
                label={t("opiInitialForm.labels.initialQuantity")}
                name="initialQuantity"
                value={values.initialQuantity}
                onChange={handleChange}
                error={touched.initialQuantity && Boolean(errors.initialQuantity)}
                helperText={touched.initialQuantity && errors.initialQuantity}
              />
              <TextField
                fullWidth
                variant="outlined"
                type="date"
                label={t("opiInitialForm.labels.processingDateInitial")}
                name="processingDateInitial"
                value={values.processingDateInitial}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                error={touched.processingDateInitial && Boolean(errors.processingDateInitial)}
                helperText={touched.processingDateInitial && errors.processingDateInitial}
                sx={{
                  "& .MuiInputBase-input::-webkit-calendar-picker-indicator": {
                    filter: "invert(1)"
                  },
                }}
              />
              <Box display="flex" justifyContent="flex-end" mt="20px">
                <Button type="submit" color="secondary" variant="contained" size="small">
                  {t("opiInitialForm.buttons.update")}
                </Button>
              </Box>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default OpiInitialForm;
